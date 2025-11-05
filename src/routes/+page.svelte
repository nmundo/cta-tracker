<script lang="ts">
	import { browser } from '$app/environment'
	import { getTrainTimes } from './trains.remote'

	const LINES = {
		Red: { name: 'Red', hex: '#C60C30' },
		Blue: { name: 'Blue', hex: '#00A1DE' },
		Brn: { name: 'Brown', hex: '#662233' },
		G: { name: 'Green', hex: '#009B3A' },
		Org: { name: 'Orange', hex: '#F9461C' },
		P: { name: 'Purple', hex: '#522398' },
		Pink: { name: 'Pink', hex: '#E27EA6' },
		Y: { name: 'Yellow', hex: '#F9E300' }
	}

	let mapId = $state('')
	let trainData: TrainData | null = $state(null)
	let favorites = $state<StationInfo[]>(
		browser && JSON.parse(localStorage.getItem('favorites') || '[]')
	)
	let loading = $state(false)

	$effect(() => {
		browser && localStorage.setItem('favorites', JSON.stringify(favorites))
	})

	const addFavorite = (station: StationInfo) => {
		if (!favorites.find((fav) => fav.staId === station.staId)) {
			favorites = [...favorites, station]
		}
	}

	const updateTimes = async () => {
		trainData = await getTrainTimes(mapId)
	}

	const getLines = () => {
		if (!trainData) return []

		const linesSet = new Set<string>()
		trainData.eta.forEach((train) => {
			linesSet.add(train.rt)
		})

		return Array.from(linesSet)
	}

	const calcTimeDelta = (arrivalTime: string) => {
		const time = new Date(arrivalTime)
		const mins = Math.round((time.getTime() - Date.now()) / 1000 / 60)

		return mins
	}
</script>

<div class="container mx-auto space-y-6 p-4">
	<section class="card bg-base-200 p-4">
		<h2 class="card-title">Favorites</h2>
		<div class="overflow-x-auto">
			<div class="flex flex-nowrap space-x-3 pb-2">
				{#each favorites as { staId, staNm, lines }}
					<div class="station-container">
						<button
							type="button"
							class="station-card flex-shrink-0"
							onclick={() => {
								mapId = staId
								updateTimes()
							}}
						>
							<div class="station-info">
								<div class="station-letter">{staNm.charAt(0)}</div>
							</div>
							<div class="station-colors">
								{#each lines as line}
									<div class="color-bar" style="background-color: {LINES[line].hex};"></div>
								{/each}
							</div>
						</button>
						<div class="station-label">{staNm}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="card bg-base-200 p-4">
		<h2 class="card-title">Find Trains</h2>
		<div class="flex gap-2">
			<input
				type="text"
				class="input-bordered input flex-grow"
				bind:value={mapId}
				placeholder="Enter station ID"
			/>
			<button class="btn btn-primary" onclick={updateTimes}>Search</button>
		</div>
	</section>

	<section class="card bg-base-200 p-4">
		{#if !trainData}
			<div class="text-center text-gray-500 italic">Enter a station to see train times.</div>
		{:else if loading}
			<div class="loading mx-auto loading-spinner"></div>
		{:else if trainData.errNm}
			<div class="text-error">Error: {trainData.errNm}</div>
		{/if}
		{#if trainData}
			{#if trainData.errNm}
				<div>{trainData.errNm}</div>
			{:else}
				<div>
					Upcoming trains at {trainData.eta[0].staNm}
					<button
						class="btn ml-4 btn-outline btn-sm"
						onclick={() =>
							addFavorite({
								staId: trainData.eta[0].staId,
								staNm: trainData.eta[0].staNm,
								lines: getLines()
							})}
					>
						Add to Favorites
					</button>
				</div>
				<ul class="list rounded-box bg-base-100 shadow-md">
					{#each trainData.eta as { destNm, arrT, rt, stpDe }}
						<li class="list-row">
							<div>
								<div class="size-10 rounded-box" style="background-color: {LINES[rt].hex};"></div>
							</div>
							<div class="flex items-center justify-between">
								<div>
									<div class="font-bold">{destNm}</div>
									<div class="text-sm text-gray-500">{stpDe}</div>
								</div>
								<div class="text-xl font-light">
									{calcTimeDelta(arrT) <= 0 ? 'Arriving' : `${calcTimeDelta(arrT)} min`}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</section>
</div>
