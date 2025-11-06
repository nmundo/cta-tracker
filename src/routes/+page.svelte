<script lang="ts">
	import { browser } from '$app/environment'
	import Typeahead from 'svelte-typeahead/Typeahead.svelte'
	import { getStations, getTrainTimes } from './trains.remote'
	import { LINES } from '../constants'
	import { onMount } from 'svelte'

	const trainStations = await getStations()

	let mapId = $state('')
	let trainData: TrainData | null = $state(null)
	let favorites = $state<StationInfo[]>(
		browser && JSON.parse(localStorage.getItem('favorites') || '[]')
	)
	let isFavorite = $derived(() =>
		trainData ? favorites.some((f) => f.staId === trainData.eta[0].staId) : false
	)
	let loading = $state(false)

	let showLeftFade = $state(false)
	let showRightFade = $state(true)

	// Left/right fade for favorites scroll
	const handleScroll = (e: Event) => {
		const el = e.currentTarget as HTMLElement
		const maxScroll = el.scrollWidth - el.clientWidth
		showLeftFade = el.scrollLeft > 0
		showRightFade = el.scrollLeft < maxScroll - 1
	}

	$effect(() => {
		localStorage.setItem('favorites', JSON.stringify(favorites))
	})

	$effect(() => {
		if (mapId) {
			loading = true
			getTrainTimes(mapId).then((data) => {
				trainData = data
				loading = false
			})
		}
	})

	const addFavorite = (station: StationInfo) => {
		if (!favorites.find((fav) => fav.staId === station.staId)) {
			favorites = [...favorites, station]
		}
	}

	const removeFavorite = (stationId: string) => {
		favorites = favorites.filter((fav) => fav.staId !== stationId)
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
	<section>
		<div class="card bg-base-200 p-4">
			<h2 class="card-title">Favorites</h2>
			{#if favorites.length === 0}
				<div class="text-center text-gray-500 italic">Add some favorites!</div>
			{:else}
				<div class="relative">
					<div class="overflow-x-auto" onscroll={handleScroll}>
						<div class="flex flex-nowrap space-x-3 p-2">
							{#each favorites as { staId, staNm, lines }}
								<div class="station-container">
									<button
										type="button"
										class="station-card flex-shrink-0"
										onclick={() => {
											mapId = staId
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

					{#if showLeftFade}
						<div
							class="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-base-200 to-transparent"
						></div>
					{/if}
					{#if showRightFade}
						<div
							class="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-base-200 to-transparent"
						></div>
					{/if}
				</div>
			{/if}
		</div>
	</section>

	<section class="card bg-base-200 p-4 shadow-lg">
		<div class="mb-4 flex gap-3">
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
		</div>

		{#if !trainData}
			<div class="text-center text-gray-500 italic">Enter a station to see arrival times.</div>
		{:else if loading}
			<div class="loading mx-auto loading-spinner"></div>
		{/if}
		{#if trainData}
			{#if trainData.errNm}
				<div class="text-error">Error: {trainData.errNm}</div>
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
						type="button"
						class="inline-flex items-center gap-3 rounded-full px-4 py-2 shadow-md transition-transform duration-150 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:outline-none"
						title={isFavorite() ? 'Remove from favorites' : 'Add to favorites'}
						onclick={() => {
							const sta = trainData.eta[0]
							if (isFavorite()) {
								removeFavorite(sta.staId)
							} else {
								addFavorite({
									staId: sta.staId,
									staNm: sta.staNm,
									lines: getLines()
								})
							}
						}}
					>
						{#if isFavorite()}
							<span class="text-sm font-medium">Remove</span>
						{:else}
							<span class="text-sm font-medium">Add</span>
						{/if}
					</button>
				</div>
				<ul class="list rounded-box bg-base-100 shadow-md">
					{#each trainData.eta as { destNm, arrT, rt, stpDe }}
						{@const timeDelta = calcTimeDelta(arrT)}
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
									{timeDelta <= 0 ? 'Now' : `${timeDelta} min`}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</section>
</div>
