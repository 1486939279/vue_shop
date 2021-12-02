import request from '@/utils/request.js'
export const getAddUser = function (add) {
  return request.post('users', add)
}
