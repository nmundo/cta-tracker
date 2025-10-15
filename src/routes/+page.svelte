<script lang="ts">
	type TrainTrackerResponse = {
		tmst: string;
		errCd: string;
		errNm: number;
		eta: {
			staId: string;
			stpId: string;
			staNm: string;
			stpDe: string;
			rn: string;
			rt: string;
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

	let mapId = $state('');
	let trainData: TrainTrackerResponse | null = $state(null);

	const updateTimes = () => {
		fetch(`/api/?mapid=${mapId}`)
			.then((r) => r.json())
			.then(({ ctatt }) => (trainData = ctatt))
			.catch((e) => console.log(e));
	};
</script>

<input bind:value={mapId} />
<button onclick={() => updateTimes()}>Submit</button>
{#if trainData}
	{#if trainData.errNm}
		<div>{trainData.errNm}</div>
	{:else}
		<table>
			<tbody>
				{#each trainData.eta as { destNm, arrT }}
					<tr>
						<td>{arrT}</td>
						<td>{destNm}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
