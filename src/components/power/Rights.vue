<template>
  <div>
    <crumbs :arr-data="['权限管理', '权限列表']"></crumbs>

    <el-card>
      <el-table :data="RightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="Number(scope.row.level) === 0">一级</el-tag>
            <el-tag v-else-if="Number(scope.row.level) === 1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {CrumbsMixin} from '../../common/mixin'
export default {
  name: 'Rights',
  // 混入
  mixins: [CrumbsMixin],
  data() {
    return {
      RightsList: []
    }
  },
  methods: {
    // 获取所有权限列表网络请求
    getRightsList() {
      this.$axios({
        url: 'rights/list'
      }).then(({data:res}) => {
        this.RightsList = res.data
        console.log(this.RightsList)
      })
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>
  
</style>