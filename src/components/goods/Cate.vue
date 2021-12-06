<template>
  <div class="cate_container">
    <!-- 用户区域面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-row>
        <el-col><el-button type="primary" @click="showAddCateDialog">添加分类</el-button></el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table :data="catelist" show-index index-text="#" border :show-row-hover="false" :columns="columns" :selection-type="false" :expand-type="false">
        <!-- 是否有效区域 -->
        <template slot="isok" slot-scope="scope">
          <!-- {{scope.row.cat_id}} -->
          <i class="el-icon-error" v-if="scope.row.cat_deleted === true" style="color: red"></i>
          <i class="el-icon-success" v-else style="color: lightgreen"></i>
        </template>
        <!-- 排序区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="editShowCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="removeShowCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[1, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 弹出添加对话框 -->
    <el-dialog @close="addCateDialogClose" title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateruleForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类: ">
          <el-cascader v-model="selectedKeys" clearable :options="parentCateList" :props="cascaderProps" @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateCascader">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 弹出编辑对话框 -->
    <el-dialog @closr="editCateDialogClose" title="编辑分类" :visible.sync="editCateDialogVisible" width="40%">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 商品分类数据
      catelist: [],
      // 商品分类总数
      total: 0,
      // 弹出添加对话框
      addCateDialogVisible: false,
      // 弹出编辑对话框
      editCateDialogVisible: false,
      // 添加分类里表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类里级联框使用的父级权限数据
      parentCateList: [],
      // 级联框双向绑定存放的id数组
      selectedKeys: [],
      // 级联框的props属性
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 编辑分类里表单数据
      editCateForm: [],
      // 为table列指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // type表示将当前列定义为自定义列
          type: 'template',
          // 自定义列的名字
          template: 'isok'
        },
        {
          label: '排序',
          // type表示将当前列定义为自定义列
          type: 'template',
          // 自定义列的名字
          template: 'order'
        },
        {
          label: '操作',
          // type表示将当前列定义为自定义列
          type: 'template',
          // 自定义列的名字
          template: 'opt'
        }
      ],
      // 添加窗口表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 编辑窗口校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      this.catelist = res.data.result
      this.total = res.data.total
      // console.log(res)
    },
    // 分页区每页条数变化
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 分页发生变化
    handleCurrentChange(newPagenum) {
      this.querInfo.pagenum = newPagenum
      this.getCateList()
    },
    // 添加分类
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取一二级权限引用级联框
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.parentCateList = res.data
    },
    // 级联框内选择项发生变化的事件
    parentCateChange() {
      // 如果selectedKeys数组里面的length大于0，证明有选中的父级
      if (this.selectedKeys.length > 0) {
        // 添加分类里父级的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 父类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return true
      } else {
        // 父级的id
        this.addCateForm.cat_pid = 0
        // 父级的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类框关闭事件
    addCateDialogClose() {
      this.$refs.addCateruleForm.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 添加分类确定
    addCateCascader() {
      this.$refs.addCateruleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 编辑分类根据id查看当前行数据
    async editShowCate(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.message.error('查询失败')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 编辑提交数据
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 编辑框关闭清空数据
    editCateDialogClose() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除分类
    async removeShowCate(id) {
      const confirmCateResult = await this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 此时如果用户点击了确定就会返回字符串confirm
      // 如果点击了取消就返回字符串cancel
      if (confirmCateResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCateList()
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
