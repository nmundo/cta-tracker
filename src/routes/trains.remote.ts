import { query } from '$app/server'
import { TRAIN_API_KEY } from '$env/static/private'
import dummyData from '../dummyData'

const colorMap = [
	{ key: 'red', name: 'Red' },
	{ key: 'blue', name: 'Blue' },
	{ key: 'g', name: 'G' },
	{ key: 'brn', name: 'Brn' },
	{ key: 'p', name: 'P' },
	{ key: 'pexp', name: 'Pexp' },
	{ key: 'y', name: 'Y' },
	{ key: 'pnk', name: 'Pink' },
	{ key: 'o', name: 'Org' }
]

export const getTrainTimes = query('unchecked', async (mapId: string) => {
	const response = await fetch(
		`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${mapId}&outputType=JSON`
	)

	const data: TrainTrackerResponse = await response.json()
	return data.ctatt
})

export const getStations = query(async (): Promise<StationStop[]> => {
	// const response = await fetch('https://data.cityofchicago.org/resource/8pix-ypme.json')

	const getLineArray = (station: StationStop) =>
		colorMap.map((c) => (station[c.key] ? c.name : null)).filter(Boolean)

	const stationMap = new Map()

	dummyData.forEach((station) => {
		// map_id to uniquely identify a station vs stop_id which can be duplicated for different lines
		if (!stationMap.has(station.map_id)) {
			stationMap.set(station.map_id, {
				map_id: station.map_id,
				station_name: station.station_name,
				station_descriptive_name: station.station_descriptive_name,
				latitude: station.location.latitude,
				longitude: station.location.longitude,
				ada: station.ada,
				lines: new Set(getLineArray(station))
			})
		} else {
			const existing = stationMap.get(station.map_id)
			existing.lines = new Set([...existing.lines, ...getLineArray(station)])
		}
	})

	return Array.from(stationMap.values())
})
