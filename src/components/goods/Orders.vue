<template>
  <div>
    <crumbs :arr-data="['订单管理', '订单列表']"></crumbs>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="orderGoodsList" style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="240px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{scope.row.update_time|timeDate}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="ordersDialogVisible = true"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="examineLogistics"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 15, 25, 35]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <el-dialog title="修改地址"
      :visible.sync="ordersDialogVisible"
      width="50%" @close="addDialogVisibleClose">
      <el-form ref="ordersFormRef" :model="ordersFormData" 
      :rules="ordersRules" 
      label-width="90px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData"
          v-model="ordersFormData.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址"  prop="address2">
          <el-input v-model="ordersFormData.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="ordersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ordersDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    
    <el-dialog title="当前物流"
      :visible.sync="logisticsDialogVisible"
      width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo" :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer">
        <el-button type="primary" @click="logisticsDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
import {formatDate} from '../../common/utils'
import cityData from '../order/citydata'
export default {
  name: 'Orders',
  mixins: [CrumbsMixin],
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取了订单列表数据
      orderGoodsList: [],
      // 一共有多少条数据
      total: 0,
      cityData,
      ordersDialogVisible: false,
      logisticsDialogVisible: false,
      // 表单数据
      ordersFormData: {
        address1: [],
        address1: ''
      },
      // 表单验证
      ordersRules: {
        address1: [{required: true, message: '请选择省市区/县', trigger: 'blur'}],
        address2: [{required: true, message: '请填写详细地址', trigger: 'blur'}]
      },
      progressInfo: []
    }
  },
  methods: {
    getOrderList() {
      this.$axios({
        url: 'orders',
        params: this.queryInfo
      }).then(({data:res}) => {
        console.log(res)
        this.orderGoodsList = res.data.goods
        this.total = res.data.total
      })
    },
    handleSizeChange(newsize) {
      this.queryInfo.newsize = newsize
      this.getOrderList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    addDialogVisibleClose() {
      this.$refs.ordersFormRef.resetFields()
    },
    // 查看物流
    examineLogistics() {
      this.$axios({
        url: '/kuaidi/1106975712662'
      }).then(({data:res}) => {
        this.progressInfo = res.data
      })
      this.logisticsDialogVisible = true
    }
  },
  filters: {
    timeDate(val) {
      const data = new Date(val * 1000)
      return formatDate(data, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>
<style lang="less" scoped>
</style>