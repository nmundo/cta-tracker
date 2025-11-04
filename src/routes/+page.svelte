<script lang="ts">
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
			rt: 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y' | 'Pexp';
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

	const updateTimes = async () => {
		fetch(`/api/?mapid=${mapId}`)
			.then((r) => r.json())
			.then(({ ctatt }) => (trainData = ctatt))
			.catch((e) => console.log(e));

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
{#if trainData}
	{#if trainData.errNm}
		<div>{trainData.errNm}</div>
	{:else}
		<ul class="list rounded-box bg-base-100 shadow-md">
			<li class="p-4 pb-2 text-2xl tracking-wide opacity-60">
				Upcoming trains at {trainData.eta[0].staNm}
			</li>
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
