<template>
  <el-container class="container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../../assets/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="dropOut ">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="inToggle ? '64px' : '200px'">
        <div class="toggle" @click="toggleFold">|||</div>
        <el-menu background-color="#323744" text-color="#fff"
          active-text-color="#369BFF" unique-opened 
          :collapse="inToggle" :collapse-transition="false" 
          router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menusLest" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="menuIco[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+cldItem.path" v-for="cldItem in item.children" 
            :key="cldItem.id" @click="activeClick('/'+cldItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{cldItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>    
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view>
        </router-view>
      </el-main>
    </el-container>
  </el-container>  
</template>
<script>
import {request} from '../../network/axios'
export default {
  name: 'Home',
  data() {
    return {
      menusLest: [],
      menuIco: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      inToggle: false,
      activePath: ''
    }
  },
  methods: {
    // 请求侧边栏数据
    getMenusList() {
      request({
        url: 'menus'
      }).then(res => {
        this.menusLest.push(...res.data.data)
      })
    },
    // 是否折叠
    toggleFold() {
      this.inToggle = !this.inToggle
    },
    activeClick(activePath) {
      sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    },
    //  退出登录
    dropOut() {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('activePath')
      this.$router.push('/login')
    }
  },
  created() {
    this.getMenusList()
    this.activePath = sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scope>
  .container {
    height: 100%;
  }
  .el-header {
    background:#373C41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    div {
      color: #fff;
      font-size: 20px;
      display: flex;
      align-items: center;
    }
  }
  .el-aside {
    background: #323744;
    .el-menu {
      border: none;
    }
  }
  .el-main {
    background: #EAEDF2;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle {
    color: #fff;
    background: #485066;
    text-align: center;
    line-height: 26px;
    cursor: pointer;
  }
</style>