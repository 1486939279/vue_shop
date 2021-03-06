import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/components/login.vue'
// import Home from '@/components/Home.vue'
// import Welcome from '@/components/welcome.vue'
// import User from '@/components/users/User.vue'
// import Rights from '@/components/rights/Rights.vue'
// import Roles from '@/components/rights/roles.vue'
// import Cate from '@/components/goods/Cate.vue'
// import Params from '@/components/goods/params.vue'
// import Goods from '@/components/goods/Goods.vue'
// import Add from '@/components/goods/Add.vue'
// import Order from '@/components/orders/order.vue'
// import report from '@/components/report/report.vue'
// 路由懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/welcome.vue')
const User = () => import(/* webpackChunkName: "user_rights_rples" */ '@/components/users/User.vue')
const Rights = () => import(/* webpackChunkName: "user_rights_rples" */ '@/components/rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: "user_rights_rples" */ '@/components/rights/roles.vue')
const Cate = () => import(/* webpackChunkName: "cate_params" */ '@/components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "cate_params" */ '@/components/goods/params.vue')
const Goods = () => import(/* webpackChunkName: "goods_add" */ '@/components/goods/Goods.vue')
const Add = () => import(/* webpackChunkName: "goods_add" */ '@/components/goods/Add.vue')
const Order = () => import(/* webpackChunkName: "goods_add" */ '@/components/orders/order.vue')
const report = () => import(/* webpackChunkName: "goods_add" */ '@/components/report/report.vue')
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '/', redirect: '/welcome' },
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: report }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach(function (to, from, next) {
  if (to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
