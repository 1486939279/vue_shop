import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/welcome.vue'
import User from '@/components/users/User.vue'
import Rights from '@/components/rights/Rights.vue'
import Roles from '@/components/rights/roles.vue'
import Cate from '@/components/goods/Cate.vue'
import Params from '@/components/goods/params.vue'
import Goods from '@/components/goods/Goods.vue'
import Add from '@/components/goods/Add.vue'
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
      { path: '/goods/add', component: Add }
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
