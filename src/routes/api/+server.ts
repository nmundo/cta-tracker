import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { TRAIN_API_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ url }) => {
	const mapid = url.searchParams.get('mapid');
	const response = await fetch(
		`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${mapid}&outputType=JSON`
	);
	const data = await response.json();

	return json(data);
};
