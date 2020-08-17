import Vue from 'vue'
import Router from 'vue-router'

import Login from '../views/login/Login'
import Home from '../views/home/Home'
import Welcome from '../views/home/children/Welcome'
import Users from '../components/users/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import Goods from '../components/goods/Goods'
import Add from '../components/goods/Add'
import CompileGoods from '../components/goods/CompileGoods'
import Orders from '../components/goods/Orders'
import Reports from '../components/goods/Reports'
// 初始化路由
Vue.use(Router)
const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods 
      },
      {
        path: '/goods/add',
        component: Add 
      },
      {
        path: '/goods/compilegoods',
        component: CompileGoods
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      }
    ]
  }
]
const router = new Router({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，代表放行
  // next() 放行  next('/login') 强制跳转到某个页面

  if(to.path === '/login') return next()
  const tokenSet = sessionStorage.getItem('token')
  console.log(tokenSet)
  if(!tokenSet) return next('/login')
  next()
})

export default router