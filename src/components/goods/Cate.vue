<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs :arr-data="['商品管理', '商品分类']"></crumbs>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateClick">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" border
      :selection-type="false" :expand-type="false" :show-index="true" 
      :show-row-hover="false" index-text="#">
      <!-- 是否有效作用域插槽 -->
        <template slot="isck" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: res" v-else></i>
        </template>
      <!-- 排序作用域插槽 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
      <!-- 操作作用域插槽 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit">编译</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
        <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">

      <el-form ref="cateFormRef" :model="cateFormData" label-width="85px" :rules="addCateFromRules">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="cateFormData.cat_name"></el-input>
        </el-form-item>
        <!-- 选择器 -->
        <el-form-item label="分类层级:">
          <el-cascader clearable
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged">
          </el-cascader>          
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
export default {
  name: 'Cate',
  mixins: [CrumbsMixin],
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table定义列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模版列
          type: 'template',
          // 表示当前这一列得模板名
          template: 'isck'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 是否显示添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单数据
      cateFormData: {
        cat_pid: 0, //分类父 ID
        cat_name: '', //分类名称
        cat_level: 0 //分类层级 
      },
      addCateFromRules: {
        cat_name: [{required: true, message: '请输入分类名称', trigger: 'blur'}],
        cat_level: [{required: true, message: '请输入分类层级', trigger: 'blur'}]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  methods:{
    getCateList() {
      this.$axios({
        url: 'categories',
        params: this.queryInfo
      }).then(({data:res}) => {
        console.log(res)
        this.cateList = res.data.result
        this.total = res.data.total
      })
    },
    // 监听  pagesize 的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 打开添加分类
    addCateClick() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    getParentCateList() {
      this.$axios({
        url: 'categories',
        params: {type: 2}
      }).then(({data:res}) => {
        console.log(res)
        this.parentCateList = res.data
      })
    },
    // 选择项发生变化时触发这个函数
    parentCateChanged() {
      if(this.selectedKeys.length > 0) {
        this.cateFormData.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.cateFormData.cat_level = this.selectedKeys.length
        return
      }
    },
    // 确定添加
    addCate() {
      this.$refs.cateFormRef.validate(val => {
        if(!val) return
        this.$axios({
          url: 'categories',
          method: 'post',
          params: this.cateFormData
        }).then(({data:{data,meta}}) => {
          if(meta.status !== 201) return this.$message.error('创建分类失败！')
          this.$message.success('创建分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      })
    },
    // 当对话框消失的时候触发
    addCateDialogClosed() {
      this.$refs.cateFormRef.resetFields()
      this.selectedKeys = []
      this.cateFormData.cat_pid = 0
      this.cateFormData.cat_level = 0
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less">
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
  .el-cascader-menu {
    height: 300px;
  }
</style>