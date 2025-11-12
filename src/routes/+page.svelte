<script lang="ts">
	import { browser } from '$app/environment'
	import { getStations, getTrainTimes } from './trains.remote'
	import { LINES } from '../lib/constants'
	import StationLogo from '$lib/components/StationLogo.svelte'
	import SearchBar from '$lib/components/SearchBar.svelte'
	import { fade, fly } from 'svelte/transition'

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
		<h2 class="card-title">Favorites</h2>
		<div class="card bg-base-200 p-4">
			{#if favorites.length === 0}
				<div class="text-center text-gray-500 italic">Add some favorites!</div>
			{:else}
				<div class="relative">
					<div class="overflow-x-auto" onscroll={handleScroll}>
						<div class="favorites-container flex flex-nowrap space-x-3 p-2">
							{#each favorites as { staId, staNm, lines }}
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
		<h2 class="card-title">Arrivals</h2>
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
							class="favorite-btn"
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
								<span>Remove</span>
							{:else}
								<span>Add</span>
							{/if}
						</button>
					</div>
					<ul class="list">
						{#each trainData.eta as { destNm, arrT, rt, stpDe, rn }, i (rn + rt + arrT)}
							{@const timeDelta = calcTimeDelta(arrT)}
							<li class="list-row" in:fly={{ y: 20, duration: 200, delay: i * 50 }} out:fade>
								<div>
									<div class="line-color" style="background-color: {LINES[rt].hex};"></div>
								</div>
								<div class="flex flex-grow items-center justify-between">
									<div>
										<div class="font-bold">{destNm}</div>
										<div class="text-sm text-gray-500">{stpDe}</div>
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
	.favorite-btn {
		align-items: center;
		border-radius: 9999px;
		cursor: pointer;
		display: inline-flex;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		transition: transform 0.15s ease;
		background: var(--card-bg);
		border: 1px solid var(--muted-border);
		backdrop-filter: blur(12px) saturate(150%);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}
	.favorite-btn:hover {
		transform: scale(1.02);
	}
	.favorite-btn:focus {
		outline: none;
		box-shadow:
			0 0 0 2px var(--accent),
			0 0 0 4px var(--accent);
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
