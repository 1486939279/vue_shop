import request from '@/utils/request.js'
// 根据id查询当前行数据
export const getIdEdit = function (id) {
  return request.get('users/' + id)
}
// 修改用户信息数据
export const getIdEditUser = function (id, obj) {
  return request.put('users/' + id, obj)
}
// 删除用户信息数据
export const removeIdUser = function (id) {
  return request.delete('users/' + id)
}
