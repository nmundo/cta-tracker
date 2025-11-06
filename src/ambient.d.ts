type TrainTrackerResponse = {
	ctatt: {
		tmst: string
		errCd: string
		errNm: number
		eta: {
			staId: string
			stpId: string
			staNm: string
			stpDe: string
			rn: string
			rt: 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y'
			destSt: string
			destNm: string
			trDr: string
			prdt: string
			arrT: string
			isApp: string
			isSch: string
			isDly: string
			isFlt: string
			flags: null
			lat: string
			lon: string
			heading: string
		}[]
	}
}

type TrainData = {
	tmst: string
	errCd: string
	errNm: number
	eta: {
		staId: string
		stpId: string
		staNm: string
		stpDe: string
		rn: string
		rt: 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y'
		destSt: string
		destNm: string
		trDr: string
		prdt: string
		arrT: string
		isApp: string
		isSch: string
		isDly: string
		isFlt: string
		flags: null
		lat: string
		lon: string
		heading: string
	}[]
}

type StationInfo = {
	staId: string
	staNm: string
	lines: LineKey[]
}

type LineKey = 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y'
