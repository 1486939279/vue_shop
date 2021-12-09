<template>
  <div>
    <!-- 用户区域面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片栏 -->
    <el-card>
      <!-- 提示栏 -->
      <el-alert title="添加商品" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 状态栏 -->
      <el-steps :space="300" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏切换 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catalist" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="topBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览弹框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data() {
    return {
      // 控制进度条与tab栏切换
      activeIndex: '0',
      // tab动态参数列表数据
      manyTableData: [],
      // tab静态属性列表数据
      onlyTableData: [],
      // 包括tab栏的表单内容
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类的数据
        goods_cat: [],
        // 图片信息对象临时存放地址
        pics: [],
        // 添加商品的描述
        goods_introduce: '',
        // 商品的动态静态参数id以及attr_vals
        attrs: []
      },
      // 上传图片预览图片的地址
      previewPath: '',
      // 控制图片预览的弹框
      previewVisible: false,
      // 商品分类数据
      catalist: [],
      // 级联选择器的规则
      cateProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 图片上传地主
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 验证表单的规则
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择分类', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('数据请求失败')
      this.catalist = res.data
    },
    // 级联框选项发生变化事件
    handleChange() {
      // console.log(this.addForm.goods_cat)
      // 如果选择的不是三级选项那就把数据清空
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat.length = []
      }
    },
    // tab切换事件返回false就不准切换
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // tab栏选中时触发
    async tabClicked() {
      // 证明访问的是动态参数tab
      if (this.activeIndex === '1') {
        // console.log(this.activeIndex)
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('动态参数获取失败')
        // 将数据的attr_vals从字符串转换成数组形式
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('动态属性获取失败')
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果事件
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 获取将要删除的图片的临时路径
      const filepath = file.response.data.tmp_path
      // 从pics数组中找到这个图片对应的索引删掉
      const i = this.addForm.pics.findIndex(x => x.pic === filepath)
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 添加商品成功
    async add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        // 因为级联框绑定了goods_cat数组所以深拷贝一下数据
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态属性的信息因为提交商品要用
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 计算属性计算级联框选中的三级选项的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 25px;
}
.el-steps--horizontal {
  margin-bottom: 20px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
/deep/ .ql-editor {
  min-height: 300px;
}
.topBtn {
  margin-top: 15px;
}
</style>
