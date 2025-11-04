import { query } from '$app/server';
import { TRAIN_API_KEY } from '$env/static/private';

type TrainTrackerResponse = {
	ctatt: {
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
};

export const getTrainTimes = query('unchecked', async (mapid: string) => {
	const response = await fetch(
		`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${mapid}&outputType=JSON`
	);

	const data: TrainTrackerResponse = await response.json();
	return data.ctatt;
});
