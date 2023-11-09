import { AllResults } from "../data/schema";

const cache = new Map<string, AllResults>();

export const getFromCacheOrFetch = async (URL: string) => {
	if (cache.has(URL)) {
		console.log("cache hit");
		return cache.get(URL)!;
	}

	console.log("cache miss");
	const response = await fetch(URL);
	const result = (await response.json()) as AllResults;
	cache.set(URL, result);
	return result;
};
