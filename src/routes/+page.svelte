<script lang="ts">
	import { browser } from '$app/environment';
	import { getTrainTimes } from './trains.remote';

	type TrainData = {
		tmst: string;
		errCd: string;
		errNm: number;
		eta: {
			staId: string;
			stpId: string;
			staNm: string;
			stpDe: string;
			rn: string;
			rt: 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y';
			destSt: string;
			destNm: string;
			trDr: string;
			prdt: string;
			arrT: string;
			isApp: string;
			isSch: string;
			isDly: string;
			isFlt: string;
			flags: null;
			lat: string;
			lon: string;
			heading: string;
		}[];
	};

	type StationInfo = {
		staId: string;
		staNm: string;
	};

	const LINES = {
		Red: { name: 'Red', hex: '#FF4242' },
		Blue: { name: 'Blue', hex: '#2D93AD' },
		Brn: { name: 'Brown', hex: '#3D3522' },
		G: { name: 'Green', hex: '#88AB75' },
		Org: { name: 'Orange', hex: '#F26419' },
		P: { name: 'Purple', hex: '#B497D6' },
		Pink: { name: 'Pink', hex: '#FFB2E6' },
		Y: { name: 'Yellow', hex: '#DBD56E' }
	};

	let mapId = $state('41220');
	let trainData: TrainData | null = $state(null);
	let favorites = $state<StationInfo[]>(
		browser && JSON.parse(localStorage.getItem('favorites') || '[]')
	);

	$effect(() => {
		if (browser) {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		}
	});

	const getFavorites = () => {
		if (browser) {
			const favs = localStorage.getItem('favorites');
			if (favs) {
				favorites = JSON.parse(favs);
			}
		}
	};

	const addFavorite = (station: StationInfo) => {
		if (!favorites.find((fav) => fav.staId === station.staId)) {
			favorites = [...favorites, station];
		}
	};

	const updateTimes = async () => {
		trainData = await getTrainTimes(mapId);
	};

	const calcTimeDelta = (arrivalTime: string) => {
		const time = new Date(arrivalTime);
		const mins = Math.round((time.getTime() - Date.now()) / 1000 / 60);

		return mins;
	};
</script>

<input type="text" class="input" bind:value={mapId} />
<button class="btn" onclick={() => updateTimes()}>Submit</button>
<div>Favorites</div>
<ul>
	{#each favorites as { staId, staNm }}
		<li>
			<button
				class="btn btn-ghost"
				onclick={() => {
					mapId = staId;
					updateTimes();
				}}
			>
				{staNm}
			</button>
		</li>
	{/each}
</ul>
{#if trainData}
	{#if trainData.errNm}
		<div>{trainData.errNm}</div>
	{:else}
		<div>
			Upcoming trains at {trainData.eta[0].staNm}
			<button
				class="btn ml-4 btn-outline btn-sm"
				onclick={() =>
					addFavorite({ staId: trainData.eta[0].staId, staNm: trainData.eta[0].staNm })}
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
					<div class="list-col-grow">
						<div class="uppercase">{LINES[rt].name} LINE</div>
						<div class="text-xs font-semibold opacity-60">{stpDe}</div>
					</div>
					<div class="text-4xl font-thin tabular-nums opacity-30">{calcTimeDelta(arrT)}</div>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
