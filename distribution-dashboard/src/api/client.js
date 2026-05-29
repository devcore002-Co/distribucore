import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.error('Unauthorized request')
    }
    return Promise.reject(err)
  }
)

export default api
