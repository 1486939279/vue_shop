<template>
  <div class="ordeer_container">
    <!-- 用户区域面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showorders"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="进度" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-share" size="mini" @click="ProgressShow"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="orderInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="orderInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 修改弹框 -->
    <el-dialog title="修改城市" :visible.sync="editOrderVisible" width="40%" @close="addressDialogClose">
      <el-form :model="editAdressForm" :rules="editAdressRules" ref="editAdressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="adress1"> <el-cascader v-model="editAdressForm.adress1" :options="cityData"></el-cascader></el-form-item>
        <el-form-item label="详细地址" prop="adress2">
          <el-input v-model="editAdressForm.adress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editOrderVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrderVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度弹框 -->
    <el-dialog title="物流进度查询" :visible.sync="ProgressVisible" width="40%">
      <el-timeline :reverse="reverse">
        <el-timeline-item v-for="(activity, index) in progresslist" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ProgressVisible = false">取 消</el-button>
        <el-button type="primary" @click="ProgressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '@/components/orders/citydata.js'
export default {
  name: 'Order',
  data() {
    return {
      orderInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //
      // 订单列表数据
      orderlist: [],
      // 物流进度数据
      progressInfo: [],
      // 数据总数
      total: 0,
      editOrderVisible: false,
      ProgressVisible: false,
      // 修改城市表单验证
      editAdressForm: {
        adress1: [],
        adress2: ''
      },
      // 城市数据
      cityData: cityData,
      // 修改弹框表单验证规则
      editAdressRules: {
        adress1: [{ required: true, message: '请输入城市', trigger: 'blur' }],
        adress2: [{ required: true, message: '请输入城市', trigger: 'blur' }]
      },
      // 物流信息数据
      progresslist: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 订单数据
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.orderInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    // 分页数据条数发生变化事件
    handleSizeChange(newSize) {
      this.orderInfo.pagesize = newSize
      this.getOrderList()
    },
    // 分页数据页数发生变化事件
    handleCurrentChange(newPage) {
      this.orderInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改城市弹框
    showorders() {
      this.editOrderVisible = true
    },
    // dialog对话框关闭事件
    addressDialogClose() {
      this.$refs.editAdressRef.resetFields()
    },
    // 进度查询dialog
    ProgressShow() {
      this.ProgressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
