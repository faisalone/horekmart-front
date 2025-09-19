import axios from 'axios';

const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Request interceptor
apiClient.interceptors.request.use(
	(config) => {
		// Add any auth tokens here if needed
		const token = localStorage.getItem('auth_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			localStorage.removeItem('auth_token');
			// Redirect to login if needed
		}
		return Promise.reject(error);
	}
);

export { apiClient };
