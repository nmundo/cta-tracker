<script lang="ts">
	import { browser } from '$app/environment'
	import Typeahead from 'svelte-typeahead/Typeahead.svelte'
	import { getStations, getTrainTimes } from './trains.remote'

	const LINES: Record<LineKey, { name: string; hex: string }> = {
		Red: { name: 'Red', hex: '#C60C30' },
		Blue: { name: 'Blue', hex: '#00A1DE' },
		Brn: { name: 'Brown', hex: '#662233' },
		G: { name: 'Green', hex: '#009B3A' },
		Org: { name: 'Orange', hex: '#F9461C' },
		P: { name: 'Purple', hex: '#522398' },
		Pink: { name: 'Pink', hex: '#E27EA6' },
		Y: { name: 'Yellow', hex: '#F9E300' }
	}

	const trainStations = await getStations()

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
		loading = true
		trainData = await getTrainTimes(mapId)
		loading = false
	}

	const getLines = () => {
		if (!trainData) return []

		const linesSet = new Set<LineKey>()
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
		<div class="overflow-x-auto" style="perspective: 1000px;">
			<div class="flex flex-nowrap space-x-3 p-2">
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
						<div class="station-label text-gray-500">{staNm}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="card bg-base-200 p-4 shadow-lg">
		<h2 class="mb-4 card-title text-2xl font-bold">Find Trains</h2>
		<div class="flex gap-3">
			<div class="flex-grow">
				<Typeahead
					hideLabel
					on:select={({ detail }) => {
						mapId = detail.original.map_id
					}}
					placeholder="Search for a station..."
					data={trainStations}
					extract={(item) => item.station_descriptive_name}
					class="w-full"
				/>
			</div>
			<button
				class="hover:btn-primary-focus btn min-w-24 transition-all duration-200 btn-primary"
				onclick={updateTimes}
			>
				Search
			</button>
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
				<div class="mb-4 flex items-center justify-between p-2">
					<div class="flex items-center gap-2">
						<h3 class="text-xl font-bold">{trainData.eta[0].staNm}</h3>
						<div class="flex gap-1">
							{#each getLines() as line}
								<div
									class="h-3 w-3 rounded-full"
									style="background-color: {LINES[line as LineKey].hex};"
									title={LINES[line as LineKey].name}
								></div>
							{/each}
						</div>
					</div>
					<button
						class="btn btn-sm btn-primary"
						disabled={favorites.some((f) => f.staId === trainData.eta[0].staId)}
						onclick={() =>
							addFavorite({
								staId: trainData.eta[0].staId,
								staNm: trainData.eta[0].staNm,
								lines: getLines()
							})}
					>
						{favorites.some((f) => f.staId === trainData.eta[0].staId)
							? 'Added to Favorites'
							: '+ Add to Favorites'}
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
