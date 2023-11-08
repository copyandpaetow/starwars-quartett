export const whenBrowserHasTime = () =>
	new Promise((resolve) => {
		try {
			requestIdleCallback(resolve, { timeout: 2000 });
		} catch (error) {
			//safari doesnt have requestIdleCallback yet
			requestAnimationFrame(() => {
				requestAnimationFrame(resolve);
			});
		}
	});

export const shuffleArray = <ArrayType>(unshuffled: ArrayType[]): ArrayType[] =>
	unshuffled
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);

export const saveParseFloat = (value: string, alternative = 0) => {
	const parsed = parseFloat(value);

	if (isNaN(parsed)) {
		return alternative;
	}
	return parsed;
};
