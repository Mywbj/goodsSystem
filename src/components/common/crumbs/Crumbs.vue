<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in arrData" :key="index">{{arrData[index]}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Crumbs',
  props: {
    arrData: {
      typoe: Array,
      defaule() {
        return []
      }
    }
  }
}
</script>

<style lang="less" scope>
  
</style>