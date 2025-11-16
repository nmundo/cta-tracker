<script lang="ts">
	import { browser } from '$app/environment'
	import { getStations, getTrainTimes } from './trains.remote'
	import { LINES } from '../lib/constants'
	import StationLogo from '$lib/components/StationLogo.svelte'
	import SearchBar from '$lib/components/SearchBar.svelte'
	import { fade, fly } from 'svelte/transition'
	import FullStationLogo from '$lib/components/FullStationLogo.svelte'
	import { SvelteSet } from 'svelte/reactivity'
	import Toolbar from '$lib/components/Toolbar.svelte'

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

		const linesSet = new SvelteSet<LineKey>()
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
		<h2 class="card-title">Favorites</h2>
		<div id="favorites-card" class="card bg-base-200 p-4">
			{#if favorites.length === 0}
				<div class="text-center text-gray-500 italic" style="height: 100%; align-content: center;">
					Add some favorites!
				</div>
			{:else}
				<div class="relative">
					<div class="overflow-x-auto" onscroll={handleScroll}>
						<div class="favorites-container flex flex-nowrap space-x-3 p-2">
							{#each favorites as { staId, staNm, lines } (staId)}
								<StationLogo
									{staNm}
									{lines}
									changeStation={() => {
										mapId = staId
									}}
								/>
							{/each}
						</div>
					</div>

					{#if showLeftFade}
						<div
							class="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/80 to-transparent dark:from-gray-900/80"
						></div>
					{/if}
					{#if showRightFade}
						<div
							class="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/80 to-transparent dark:from-gray-900/80"
						></div>
					{/if}
				</div>
			{/if}
		</div>
	</section>

	<section>
		<div class="flex items-center justify-between" style="margin-right: 1.75rem;">
			<h2 class="card-title">Arrivals</h2>
			{#if trainData && !trainData.errNm}
				<time
					class="text-xs text-gray-400"
					title={new Date(trainData.tmst).toLocaleString()}
					aria-label={`Last updated ${trainData.tmst}`}
				>
					{`Updated ${new Date(trainData.tmst).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
				</time>
			{/if}
		</div>

		<div class="card bg-base-200 p-4 shadow-lg">
			<div class="mb-4 flex gap-3">
				<div class="flex-grow">
					<SearchBar
						data={trainStations}
						onSelect={(id) => {
							mapId = id
						}}
					/>
				</div>
			</div>

			{#if !trainData}
				<div class="text-center text-gray-500 italic">Enter a station to see arrival times.</div>
			{/if}
			{#if trainData}
				{#if trainData.errNm}
					<div class="text-error">Error: {trainData.errNm}</div>
				{:else}
					<div class="header">
						<FullStationLogo lines={getLines()} staNm={trainData.eta[0].staNm} />
						<Toolbar
							isFav={isFavorite()}
							{loading}
							refresh={() => {
								loading = true
								getTrainTimes(mapId).then((data) => {
									trainData = data
									loading = false
								})
							}}
							toggleFav={() => {
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
						/>
					</div>
					<ul class="list">
						{#each trainData.eta as { destNm, arrT, rt, rn }, i (rn + rt + arrT)}
							{@const timeDelta = calcTimeDelta(arrT)}
							<li class="list-row" in:fly={{ y: 20, duration: 200, delay: i * 50 }} out:fade>
								<div>
									<div class="line-color" style="background-color: {LINES[rt].hex};"></div>
								</div>
								<div class="flex flex-grow items-center justify-between">
									<div>
										<div class="font-bold">{destNm}</div>
									</div>
									<div class="text-right text-xl font-light">
										{timeDelta <= 0 ? 'Now' : `${timeDelta} min`}
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>
	</section>
</div>

<style>
	#favorites-card {
		height: 152px;
	}
	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.list {
		box-shadow: 0 8px 24px rgba(2, 6, 23, 0.12);
		list-style: none;
		margin: 0;
		padding: 0;
		border-radius: 24px;
	}
	.list-row {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.75rem;
		border-bottom: 1px solid var(--muted-border);
	}
	.line-color {
		width: 40px;
		height: 40px;
		border-radius: 12px;
	}
</style>
