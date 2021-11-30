import request from '@/utils/request.js'
export const getArticleAPI = function(username, password) {
  return request.post('login', {
    username,
    password
  })
}
