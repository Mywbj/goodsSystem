import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router/index'
import './assets/css/base.css'
import less from 'less'
import './assets/fonts/iconfont.css'
import treeTable from 'vue-table-with-tree-grid'

Vue.component('tree-table',treeTable)

Vue.config.productionTip = false
// 添加事件总线
Vue.prototype.$bus = new Vue

import {request} from './network/axios'
// 把封装好的网络请求添加在vue的原型上
Vue.prototype.$axios = request



new Vue({
  render: h => h(App),
  router
}).$mount('#app')
