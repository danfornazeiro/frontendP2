const LOCAL_API_BASE_URL = 'http://177.153.39.4:8080/dropcity';

export const API_BASE_URL =
	typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
		? LOCAL_API_BASE_URL
		: '/dropcity';
