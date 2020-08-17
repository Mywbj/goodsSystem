import axios from 'axios'
// import Vue from 'vue'
// 配置请求的根路劲
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export function request(obj) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      baseURL: 'http://127.0.0.1:8888/api/private/v1/',
      timeuot: 5000
    })
    instance.interceptors.request.use(config => {
      NProgress.start()
      config.headers.Authorization = sessionStorage.getItem('token')
      return config
    })
    instance.interceptors.response.use(config => {
      NProgress.done()
      return config
    })
    instance(obj).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}