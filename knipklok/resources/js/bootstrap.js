import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Swiss Barber Express Backend API
window.API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

window.api = axios.create({
    baseURL: window.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Automatically attach customer/barber token if available
window.api.interceptors.request.use((config) => {
    const token = localStorage.getItem('swiss_barber_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle unauthorized requests
window.api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('swiss_barber_token');
            localStorage.removeItem('swiss_barber_user');
        }

        return Promise.reject(error);
    }
);