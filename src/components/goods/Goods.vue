<template>
  <div>
    <crumbs :arr-data="['商品管理', '商品列表']"></crumbs>
    <!-- 试图卡片区域 -->
    <el-card>
      <!-- 搜索添加按钮 -->
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsClick">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品表格 -->
      <el-table :data="goodsList" style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="75px"></el-table-column>
        <el-table-column label="创建时间" width="165px">
          <template slot-scope="scope">
            {{scope.row.add_time | timeDate}}
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="compileGoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 40, 60]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
import {formatDate} from '../../common/utils'
export default {
  name: 'Goods',
  mixins: [CrumbsMixin],
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0,
      // 商品列表
      goodsList: []
    }
  },
  methods: {
    getGoodsList() {
      this.$axios({
        url: 'goods',
        params: this.queryInfo
      }).then(({data:res}) => {
        this.total = res.data.total
        this.goodsList = res.data.goods
      })
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    deleteGoods(id) {
      this.$messageBox('是否永久删除该商品 ?',  '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$axios({
          url: 'goods/' + id,
          method: 'delete'
        }).then(({data:{meta}}) => {
          if(meta.status !== 200) return this.$message.error('删除商品失败！')
          this.$message.success('删除商品成功')
          this.getGoodsList()
        })
      }).catch(err => {
        this.$message.error('取消删除！')
      })
    },
    // 添加商品
    addGoodsClick() {
      this.$router.push('/goods/add')
    },
    // 编辑商品
    compileGoods(id) {
      this.$router.push('/goods/compilegoods')
      this.$axios({
        url: 'goods/' + id
      }).then(({data:res}) => {
        // console.log(res)
        this.$bus.$emit('abc',res)
      })
    }
  },
  // 过滤器
  filters: {
    timeDate(val) {
      const data = new Date(val * 1000)
      return formatDate(data, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>
<style lang="less" scoped>
  
</style>