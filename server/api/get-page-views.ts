export default defineEventHandler(async () => {
	const config = useRuntimeConfig();

	const authRes = await $fetch<{ token?: string }>(config.umamiEndpoint + '/api/auth/login', {
		method: 'POST',
		body: {
			username: config.umamiUsername,
			password: config.umamiPassword
		}
	});

	if (authRes.token) {
		const pageViewRes = await $fetch(config.umamiEndpoint + `/api/websites/2056540d-6201-4ab2-8af2-d793dce4abc1/pageviews?startAt=${new Date().getTime() - 604800000}&endAt=${new Date().getTime()}&unit=hour&timezone=Asia/Chongqing`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${authRes.token}`
			}
		});

		return pageViewRes;
	}

	return null;
});
