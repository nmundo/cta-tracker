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

type LineKey = 'Red' | 'Blue' | 'Brn' | 'G' | 'Org' | 'P' | 'Pink' | 'Y' | 'Pexp'

type StationLocation = {
	latitude: string
	longitude: string
	human_address: string // stringified JSON
}

type StationApiResponse = {
	stop_id: string
	direction_id: string
	stop_name: string
	station_name: string
	station_descriptive_name: string
	map_id: string
	ada: boolean
	red: boolean
	blue: boolean
	g: boolean
	brn: boolean
	p: boolean
	pexp: boolean
	y: boolean
	pnk: boolean
	o: boolean
	location: StationLocation
	[key: string]: unknown
}

type StationStop = {
	stop_id: string
	direction_id: string
	stop_name: string
	station_name: string
	station_descriptive_name: string
	map_id: string
	ada: boolean
	lines: Set<LineKey>
	location: StationLocation
}
