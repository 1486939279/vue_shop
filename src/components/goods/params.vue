<template>
  <div class="params_container">
    <!-- 用户区域面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert show-icon title="注意： 只允许为第三级分类设置相关参数" type="warning" :closable="false"> </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类： </span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader clearable v-model="selectedOptions" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" size="mini" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数的表格信息 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row class="rowcenter">
                  <!-- 循环渲染标签 -->
                  <el-tag @close="handleClose(i, scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">{{ item }}</el-tag>
                  <!-- 输入的文本框标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delate" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" size="mini" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性的表格信息 -->
          <el-table :data="onlyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row class="rowcenter">
                  <!-- 循环渲染标签 -->
                  <el-tag @close="handleClose(i, scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">{{ item }}</el-tag>
                  <!-- 输入的文本框标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delate" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/属性的对话框，这里动态添加 -->
    <el-dialog @close="addDialogClosed" :title="'添加' + titleText" :visible.sync="addDialogVisible" width="40%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数/属性的对话框，这里动态添加 -->
    <el-dialog @close="editDialogClosed" :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="40%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 所有商品的分类数据
      catelist: [],
      // 级联选择框选中的选项id
      selectedOptions: [],
      cateProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 页签区域model双向绑定的值填写了就是默认值
      activeName: 'many',
      // many动态数据
      manyTabData: [],
      // only静态数据
      onlyTabData: [],
      // 添加动态参数/静态属性的对话框开关
      addDialogVisible: false,
      // 添加动态参数/静态属性的表单
      addForm: {},
      // 编辑动态参数/静态属性的对话框开关
      editDialogVisible: false,
      // 编辑动态参数/静态属性的表单
      editForm: {},
      // 添加表单里面的验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      // 编辑表单里面的验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取所有分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      this.catelist = res.data
    },
    // 级联选择框选项发生变化事件
    handleChange() {
      this.getParamsData()
    },
    // 页签区tab栏切换事件
    handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    },
    // 因为切换tab栏也要获取到级联框的三级选项信息所以单独抽离
    async getParamsData() {
      // 选中的不是三级分类就默认清空
      if (this.selectedOptions.length !== 3) {
        this.selectedOptions = []
        // 选中的不是级联框三级选项就把tab切换里的数据都清空
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      // 选中的是三级选项分类就将下面的所有参数获取出来
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 双向绑定文本框值
        item.inputValue = ''
      })
      console.log(res.data)
      // 获取的数据只有一份,要判断是many动态数据给他存在data相应数据，only同理
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    // 添加参数对话框关闭事件清除所有表单内容及规则
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 确定添加属性或者参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 弹出编辑参数对话框
    async showParams(id) {
      // 根据id查询编辑框里表单数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑参数对话框事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      // 提交表单验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(id) {
      const confirmParamsResult = await this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 此时如果用户点击了确定就会返回字符串confirm
      // 如果点击了取消就返回字符串cancel
      if (confirmParamsResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 按下按钮展示文本框
    showInput(row) {
      row.inputVisible = true
      // 并在渲染后获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框标签，按下enter或者失去焦点触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 没有return出去的话就发起请求提交数据渲染
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求保存数据
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      // 发起请求保存数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('编辑失败')
      this.$message.success('修改参数成功')
    },
    // 删除标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 级联框选中三级才能按钮修改,
    isBtnDisabled() {
      if (this.selectedOptions.length !== 3) {
        return true
      }
      return false
    },
    // 只有选中级联框三级选项才会返回值并且是最后一个的id
    cateId() {
      if (this.selectedOptions.length === 3) {
        return this.selectedOptions[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-col-24 {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin: 10px;
}
.rowcenter {
  margin-left: 50px;
}
.input-new-tag {
  width: 120px;
}
</style>
