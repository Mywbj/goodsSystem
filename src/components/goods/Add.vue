<template>
  <div>
    <crumbs :arr-data="['商品管理', '商品列表', '添加商品']"></crumbs>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 信息提示 -->
      <el-alert title="添加商品信息" type="info" :closable="false" center show-icon></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs栏区域 -->
      <el-form ref="addFormRef" :model="addGoodsFormData" label-width="80px" 
      label-position="top" :rules="addFormRules">
        <el-tabs v-model="activeIndex" :tab-position="'left'" 
        :before-leave="beforeLeave" @tab-click="tabsActive">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsFormData.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsFormData.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsFormData.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsFormData.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 级联选择器 -->
            <el-form-item label="商品分类">
              <el-cascader style="width:300px" v-model="addGoodsFormData.goods_cat" 
              :options="CateList"
              :props="cateProps"
              @change="getAddHandleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 动态参数复选框 -->
              <el-checkbox-group v-model="item.attr_vals" >
                <el-checkbox border :label="cd" v-for="(cd,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,i) in onlyTableData" :key="i">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <el-upload
              :action="loandImgUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture" :headers="headers"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>            
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本 -->
            <quill-editor v-model="addGoodsFormData.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoodsCon">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previeVisible" width="50%">
      <img :src="previewPath" style="width: 100%">
    </el-dialog>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
// 递归
import {deepClone} from '../../common/deepClone'
export default {
  name: 'Add',
  components: {quillEditor},
  mixins: [CrumbsMixin],
  data() {
    return {
      activeIndex: '0',
      // 表单信息数据
      addGoodsFormData: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 保存图片的路径
        pics: [],
        // 商品内容
        goods_introduce: '',
        attrs: []
      },
      // 表单验证
      addFormRules: {
        goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
        goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
        goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}]
      },
      // 配置级联选择器
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 获取所有商品分类的数据
      CateList: [],
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 上传图片的路径
      loandImgUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置图片上传的报文头
      headers: {
        Authorization: sessionStorage.getItem('token')
      },
      // 图片预览
      previeVisible: false,
      // 图片路径
      previewPath: ''
    }
  },
  methods: {
    getCateList() {
      this.$axios({
        url: 'categories'
      }).then(({data: res}) => {
        this.CateList = res.data
      })
    },
    getAddHandleChange(){
      if(this.addGoodsFormData.goods_cat.length !== 3) return this.addGoodsFormData.goods_cat = []

    },
    // tab的钩子
    beforeLeave(activeName, oldActiveName) {
      if(oldActiveName == 0 && this.addGoodsFormData.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！') 
        return false
      }

    },
    // 当tabs页变动的时候会触发
    tabsActive() {
      console.log(this.activeIndex)
      if(this.activeIndex === '1') this.getManyTableData('many')
      if(this.activeIndex === '2') this.getManyTableData('only')
    },
    // 获取动态参数
    getManyTableData(sels) {
      this.$axios({
        url: `categories/${this.careId}/attributes`,
        params: {sel: sels}
      }).then(({data: res}) => {
        if(res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！') 

       
        if(this.activeIndex === '1') {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals = '' ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        }else if(this.activeIndex === '2'){
          this.onlyTableData = res.data
        }

      })
    },
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previeVisible = true
    },
    handleRemove(file) {
      const ImgPath = this.addGoodsFormData.pics.findIndex(item => item.pic === file.response.data.tmp_path)
      this.addGoodsFormData.pics.splice(ImgPath,1)
    },
    // 图片上传成功时的回调
    handleSuccess(response) {
      const picInfo = {pic: response.data.tmp_path}
      this.addGoodsFormData.pics.push(picInfo)
    },
    // 添加商品
    addGoodsCon() {
      this.$refs.addFormRef.validate(val => {
        if(!val) return this.$message.error('请填写完整表单的内容！')
        const forms = deepClone(this.addGoodsFormData)
        forms.goods_cat = this.addGoodsFormData.goods_cat.join(',')
        // 处理动态参数
        
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addGoodsFormData.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsFormData.attrs.push(newInfo)
        })
        forms.attrs = this.addGoodsFormData.attrs
        console.log(forms.attrs)
        // 发起添加商品请求
        this.$axios({
          url: 'goods',
          method: 'post',
          params: forms
        }).then(({data:res}) => {
          // console.log(res)
          // if(res.meta.status !== 201) return this.$message.error('添加商品失败！')
          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
        }) 
      })
    }
  },
  computed: {
    careId() {
      if(this.addGoodsFormData.goods_cat.length !== 3) return []
      return this.addGoodsFormData.goods_cat[2]
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
<style lang="less" >
  .el-steps {
    margin: 15px 0;
  }
  .el-cascade {
    width: 300px;
  }
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .ql-editor {
    min-height: 300px !important;
  }
  .btnAdd {
    margin-top: 10px;
  }
</style>