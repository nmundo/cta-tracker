import { query } from '$app/server'
import { TRAIN_API_KEY } from '$env/static/private'
import dummyData from '../dummyData'

export const getTrainTimes = query('unchecked', async (mapid: string) => {
	const response = await fetch(
		`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${mapid}&outputType=JSON`
	)

	const data: TrainTrackerResponse = await response.json()
	return data.ctatt
})

export const getStations = query(async (): Promise<StationStop[]> => {
	// const response = await fetch('https://data.cityofchicago.org/resource/8pix-ypme.json')
	const response = dummyData

	return response
})
