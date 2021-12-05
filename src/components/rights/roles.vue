<template>
  <div class="roles_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col><el-button type="primary" @click="roleDialogVisible = true">添加角色</el-button></el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" stripe border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 行 -->
            <el-row :class="['colcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 第一列放一级权限 -->
              <el-col :span="5" :class="['rowcenter', 'colcenter']">
                <el-tag @close="removeByIdClose(scope.row, item1.id)" closable>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列放二级权限三级权限 -->
              <el-col :span="19">
                <!-- 第二列里的行 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'colcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 第二列里的行第一列放第二级权限 -->
                  <el-col :span="7">
                    <el-tag @close="removeByIdClose(scope.row, item2.id)" closable type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 第二列里的行的第二列放第三级权限 -->
                  <el-col :span="17">
                    <el-tag @close="removeByIdClose(scope.row, item3.id)" closable type="warning" :class="[]" v-for="item3 in item2.children" :key="item3.id">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button @click="showRoleVisible(scope.row.id)" type="primary" icon="el-icon-edit">编辑</el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button @click="removeRoleUser(scope.row.id)" type="danger" icon="el-icon-delete">删除</el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-delete">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹出框 -->
    <el-dialog title="修改角色" @close="roleDialogClose" :visible.sync="roleDialogVisible" width="40%">
      <el-form :model="roleForm" :rules="roleFormRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色弹出框 -->
    <el-dialog title="修改角色" @close="editRoleDialogClose" :visible.sync="editRoleDialogVisible" width="40%">
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名">
          <el-input v-model="editRoleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限弹出框 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" @close="setRightDialogClose" width="30%">
      <el-tree ref="treeRef" :data="setList" :default-checked-keys="defKeys" :props="setdefaultProps" show-checkbox default-expand-all node-key="id"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllotRight, setRightList, removeByIdTag, rmoveRoleUser, getRoleAddUser, getIdRoleList, getEditRoleUser } from '@/API/rights.js'
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [],
      setList: [],
      // 分配权限的角色id
      roleId: '',
      // 根据id默认展开已有权限数组
      defKeys: [],
      roleDialogVisible: false,
      editRoleDialogVisible: false,
      setRightdialogVisible: false,
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      editRoleForm: [],
      roleFormRules: {
        roleName: [
          { required: true, message: '请输入你的角色名字', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入你的角色描述', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ]
      },
      editRoleFormRules: {
        roleDesc: [
          { required: true, message: '请输入你的角色描述', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ]
      },
      setdefaultProps: {
        children: 'children',
        label: 'authName'
      }
    }
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色失败')
      this.roleList = res.data
    },
    // 关闭添加角色框清除所有数据
    roleDialogClose() {
      this.$refs.roleFormRef.resetFields()
    },
    // 添加用户
    addRoleUser() {
      this.$refs.roleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await getRoleAddUser(this.roleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.roleDialogVisible = false
        this.getRoleList()
      })
    },
    // 点击修改按钮根据当前id获取数据
    async showRoleVisible(id) {
      const { data: res } = await getIdRoleList(id)
      if (res.meta.status !== 200) return this.message.error('查询失败')
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 修改当前行数据
    editRoleUser() {
      this.$refs.editRoleFormRef.validate(async valid => {
        const { data: res } = await getEditRoleUser(this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        this.editRoleDialogVisible = false
        this.getRoleList()
      })
    },
    // 修改框关闭清除所有数据
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 点击删除按钮删除当前行
    async removeRoleUser(id) {
      const confirmRoleResult = await this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 此时如果用户点击了确定就会返回字符串confirm
      // 如果点击了取消就返回字符串cancel
      if (confirmRoleResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await rmoveRoleUser(id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getRoleList()
    },
    // 删除权限
    async removeByIdClose(role, rightid) {
      const confirmRemoveById = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 此时如果用户点击了确定就会返回字符串confirm
      // 如果点击了取消就返回字符串cancel
      if (confirmRemoveById !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await removeByIdTag(role, rightid)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      role.children = res.data
    },
    // 分配权限展示树状图
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await setRightList()
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.setList = res.data
      // console.log(res)
      this.getLearKeys(role, this.defKeys)
      this.setRightdialogVisible = true
    },
    // 封装递归函数，获取行内所有已有权限id，三级权限
    getLearKeys(node, arr) {
      // 如果当前node节点不包括children属性则是三级节点将其id放到数组arr
      if (!node.children) return arr.push(node.id)
      // 一直循环获取直到没有children 加到arr退出数组
      node.children.forEach(item => {
        this.getLearKeys(item, arr)
      })
    },
    // 监听分配权限对话框关闭清空数组事件
    setRightDialogClose() {
      this.defKeys = []
    },
    // 点击确定后分配权限成功并刷新
    async allotRight() {
      // 获取所有被选中id的权限以及它的父权限数组
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // 将权限数组转化成字符串
      const idStr = keys.join(',')
      // console.log(idStr)
      const { data: res } = await getAllotRight(this.roleId, idStr)
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.setRightdialogVisible = false
      this.getRoleList()
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.colcenter {
  display: flex;
  align-items: center;
}
.rowcenter {
  display: flex;
  justify-content: center;
}
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
