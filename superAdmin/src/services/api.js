import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const TOKEN_KEY = 'swiss_barber_token'
export const USER_KEY = 'swiss_barber_user'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error?.config?.url?.includes('/auth/login')

    if (error?.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }

    return Promise.reject(error)
  },
)

/* Pull a readable message out of any axios error */
export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback

/* Backend wraps data as { success, data } */
export const unwrap = (response) => response?.data?.data ?? response?.data

/* Accepts an array or { items | rows | list | <key> } and returns an array */
export const toList = (data, key) => {
  if (Array.isArray(data)) return data
  if (key && Array.isArray(data?.[key])) return data[key]
  for (const k of ['items', 'rows', 'list', 'data']) {
    if (Array.isArray(data?.[k])) return data[k]
  }
  return []
}

export default api
