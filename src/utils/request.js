import axios from 'axios'
const request = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
request.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
export default request
