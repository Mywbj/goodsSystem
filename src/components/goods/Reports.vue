<template>
  <div>
    <crumbs :arr-data="['数据统计', '数据报表']"></crumbs>
    <!-- 卡片视图-->
    <el-card>
      <!-- 绘制一个简单的图表 -->
      <div id="main" style="width: 1000px;height:500px;"></div>
    </el-card>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
import echarts from 'echarts'
export default {
  name: 'Reports',
  mixins: [CrumbsMixin],
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {
    echarts(option) {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'));
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },
    getReports() {
      this.$axios({
        url: 'reports/type/1'
      }).then(({data:res}) => {
       const objEcharts = Object.assign(this.options, res.data)
       objEcharts.xAxis.push({boundaryGap: false})
       this.echarts(objEcharts)
       console.log(objEcharts)
      })
    }
  },
  created() {
    this.getReports()
  }
}
</script>
<style lang="less" scoped>
  
</style>