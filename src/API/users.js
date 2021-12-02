import request from '@/utils/request.js'
export const getUsersList = function (query, pagenum, pagesize) {
  return request.get('users', {
    params: {
      query,
      pagenum,
      pagesize
    }
  })
}
