import request from '@/utils/request.js'
// 获取列表权限
export const getRightList = function () {
  return request.get('rights/list')
}
// 获取角色列表
export const getRolesList = request.get('roles')
// 添加用户
export const getRoleAddUser = function (obj) {
  return request.post('roles', obj)
}
// 根据id查询当前行角色数据
export const getIdRoleList = function (id) {
  return request.get('roles/' + id)
}
// 修改角色信息
export const getEditRoleUser = function (id, obj) {
  return request.put('roles/' + id, obj)
}
// 删除当前行
export const rmoveRoleUser = function (id) {
  return request.delete('roles/' + id)
}
// 删除权限
export const removeByIdTag = function (role, rightid) {
  return request.delete('roles/' + role.id + '/rights/' + rightid)
}
// 获取树状图权限
export const setRightList = function () {
  return request.get('rights/tree')
}
// 角色授权
export const getAllotRight = function (id, str) {
  return request.post('roles/' + id + '/rights', { rids: str })
}
