<template>
  <div class="user_container">
    <!-- 用户区域面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 用户搜索框添加区 -->
      <el-row :gutter="30">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="query" clearable @clear="getUserList"> <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> </el-input>
        </el-col>
        <el-col :span="4"><el-button type="primary" @click="addDialogVisible = true">添加用户</el-button></el-col>
      </el-row>
      <el-table :data="userlist" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button @click="showDialogVisible(scope.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!--删除按钮  -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" @click="removeUser(scope.row.id)" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-star-off" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[1, 3, 6, 10]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      <!-- 添加用户弹出框 -->
      <el-dialog title="添加用户" @close="addDialogClosed" :visible.sync="addDialogVisible" width="30%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户弹出框 -->
      <el-dialog title="修改用户" @close="editDialogColse" :visible.sync="editDialogVisible" width="30%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名称">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getUsersList } from '@/API/users.js'
import request from '@/utils/request.js'
import { getAddUser } from '@/API/getAddUser.js'
import { getIdEdit, getIdEditUser, removeIdUser } from '@/API/idEdit.js'
export default {
  name: 'User',
  data() {
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])/
      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的邮箱'))
      }
    }
    const checkMobile = (rule, value, cb) => {
      const regMabile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMabile.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的手机号'))
      }
    }
    return {
      query: '',
      // 当前的所在页码数
      pagenum: 1,
      // 当前每页显示多少条数据
      pagesize: 10,
      userlist: [],
      total: 0,
      // 控制弹窗
      addDialogVisible: false,
      editDialogVisible: false,
      editForm: [],
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入你的名字', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入你的密码', trigger: 'blur' },
          { min: 6, max: 11, message: '长度在 6 到 11 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入你的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入你的手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入你的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入你的手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await getUsersList(this.query, this.pagenum, this.pagesize)
      if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await getAddUser(this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 点击修改按钮后根据id查询当前行数据
    async showDialogVisible(id) {
      const { data: res } = await getIdEdit(id)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭修改弹框清除表单数据
    editDialogColse() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户当前行数据
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await getIdEditUser(this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        console.log(res)
        if (res.meta.status !== 200) return
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 删除用户
    async removeUser(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 此时如果用户点击了确定就会返回字符串confirm
      // 如果点击了取消就返回字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await removeIdUser(id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 添加用户框关闭清除表单事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 分页
    handleSizeChange(newSize) {
      this.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关的状态改变
    async userStateChanged(userinfo) {
      const { data: res } = await request.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped></style>
