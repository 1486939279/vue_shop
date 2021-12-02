<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="@/assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container class="content_box">
      <!-- 侧边栏区域 -->
      <el-aside :width="forcollapse ? '64px' : '200px' ">
        <!-- 折叠按钮 -->
        <div class="toggle_button" @click="iscollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" :default-active="activePath" router :collapse-transition="false" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="forcollapse">
          <!-- 侧边栏一级菜单 -->
          <el-submenu :index="item.path" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单区域 -->
            <el-menu-item @click="savNavState('/' + subItem.path)" :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { getMenuList } from '@/API/menus.js'
export default {
  name: 'Home',
  data() {
    return {
      menulist: [],
      icons: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      forcollapse: false,
      activePath: ''
    }
  },
  created() {
    this.menusList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录功能
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async menusList() {
      const { data: res } = await getMenuList
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    iscollapse() {
      this.forcollapse = !this.forcollapse
    },
    savNavState(activePath) {
      this.activePath = activePath
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #fff;
  background-color: #373d41;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
  .toggle_button {
    background-color: #4a5064;
    font-size: 10px;
    text-align: center;
    line-height: 21px;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
</style>
