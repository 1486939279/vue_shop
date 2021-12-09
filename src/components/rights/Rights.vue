<template>
  <div class="rights_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">权限一</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">权限二</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">权限三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getRightList } from '@/API/rights.js'
export default {
  name: 'Rights',
  data() {
    return {
      rightList: []
    }
  },
  methods: {
    async getRightsList() {
      const { data: res } = await getRightList()
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightList = res.data
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped></style>
