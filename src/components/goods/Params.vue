<template>
  <div>
    <crumbs :arr-data="['商品管理', '分类参数']"></crumbs>

    <el-card>
      <!-- 警告区域 -->
      <el-alert
      title="注意：只允许为第三级分类设置相关参数！"
      type="warning" show-icon :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader style="width: 30%"
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addCarte">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag @close="handleClose(index,scope.row)" closable v-for="(item, index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="amendParams(scope.row)">编译</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deteleParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addCarte">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="amendParams(scope.row)">编译</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deteleParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加参数和属性对话框 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="adddialogVisible"
          width="40%" @close="addClose">
          <el-form ref="addFormRef" :model="addFormData" label-width="80px" :rules="addRules">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addFormData.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="adddialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCarteClick">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 编辑对话框 -->
        <el-dialog
          :title="'修改' + titleText"
          :visible.sync="amendDialogVisible"
          width="40%">
          <el-form ref="addFormRef" :model="addFormData" label-width="80px" :rules="addRules">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addFormData.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="amendDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="amendParameter">确 定</el-button>
          </span>
        </el-dialog>

      </el-tabs>
    </el-card>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
export default {
  name: 'Params',
  mixins: [CrumbsMixin],
  data() {
    return {
      cateList: [],
      // 级联选择器的配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中每一项 会记录到这个数组中
      selectedKeys: [],
      // 被 tab 激活页的名称
      activeName: 'many',
      // 这是获取tab动态参数的列表
      manyTableData: [],
      // 这是获取tab静态的属性列表
      onlyTableData: [],
      adddialogVisible: false,
      amendDialogVisible: false,
      addFormData: {
        attr_name: ''
      },
      // add表单验证
      addRules: {
        attr_name:[{required: true, message: '请输入参数', trigger: 'blur'}]
      }
    }
  },
  methods: {
    // 获取所有的商品列表
    getCateList() {
      this.$axios({
        url: 'categories'
      }).then(({data: res}) => {
        this.cateList = res.data
      })
    },
    // 选择项发生变化时触发这个函数
    handleChange() {
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParamsList()
    },
    // 每当tab签页发生改变的时候会触发这个函数
    handleTabClick() {
      if(this.manyTableData.length === 0) return
      this.getParamsList()
    },
    // 获取分类参数列表
    getParamsList() {
      this.$axios({
        url: `categories/${this.cateId}/attributes`,
        params: {sel: this.activeName}
      }).then(({data: res}) => {
        console.log(res)
        res.data.forEach(item => {
        item.attr_vals =  item.attr_vals === '' ? [] : item.attr_vals.split(' ')
          item.inputVisible = false
        })
        if(this.activeName === 'many') {
          this.manyTableData = res.data
        }else {
          this.onlyTableData = res.data
        }
      })
    },
    // 打开添加商品参数和属性对话框
    addCarte() {
      this.adddialogVisible = true
    },
    // 当对话框关闭的时候触发
    addClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添确定加参数
    addCarteClick() {
      this.$axios({
        url: `categories/${this.cateId}/attributes`,
        method: 'post',
        params: {
          attr_name: this.addFormData.attr_name,
          attr_sel: this.activeName
        }
      }).then(({data: res}) => {
        if(res.meta.status !== 201) return this.$message.error('创建'+this.titleText+'失败！')
        this.$message.success('创建'+this.titleText+'成功')
        this.getParamsList()
        this.adddialogVisible = false
      })
    },
    // 打开修改参数对话框
    amendParams(newParams) {
      this.$axios({
        url: `categories/${this.cateId}/attributes/${newParams.attr_id}`,
        params: {
          attr_sel: this.activeName
        }
      }).then(({data: {data,meta}}) => {
        if(meta.status !== 200 || meta.status === 401){
         this.$message.error('用户没有访问权限！')
         return 
        } 
        this.addFormData = data
        this.amendDialogVisible = true
      })
    },
    // 确定修改参数
    amendParameter() {
      this.$axios({
        url: `categories/${this.cateId}/attributes/${this.addFormData.attr_id}`,
        method: 'put',
        params: {
          attr_name: this.addFormData.attr_name,
          attr_sel: this.activeName
        }
      }).then(({data:{meta}}) => {
        if(meta.status !== 200) return this.$message.error('修改失败！')
        this.$message.success('更新成功')
        this.getParamsList()
        this.amendDialogVisible = false
      })
    },
    // 删除
    deteleParams(newParams) {
      this.$messageBox('是否永久删除该权限 ?',  '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$axios({
          url: `categories/${this.cateId}/attributes/${newParams.attr_id}`,
          method: 'delete'
        }).then(({data:{meta}}) => {
          if(meta.status !== 200) return this.$message.error('删除失败！')
          this.$message.success('删除成功')
          this.getParamsList()
        })
      }).catch(err => {
        this.$message.error('取消删除！')
      })
    },
    // 当文本失去焦点的时候触发
    handleInputConfirm(newScope) {
      if(newScope.inputValue.trim().length === 0) {
        newScope.inputValue = ''
        newScope.inputVisible = false
        return
      }
      // 如果不等于0就是有内容 
      newScope.attr_vals.push(newScope.inputValue)
      newScope.inputValue = ''
      newScope.inputVisible = false
      this.redactTag(newScope)
    },
    redactTag(newScope) {
      this.$axios({
        method: 'put',
        url: `categories/${this.cateId}/attributes/${newScope.attr_id}`,
        params: {
          attr_name: newScope.attr_name,
          attr_sel: newScope.attr_sel,
          attr_vals: newScope.attr_vals.join(' ')
        }
      }).then(({data: res}) => {
        console.log(res)
      })
    },
    // 当点击的时候触发
    showInput(newScope) {
      newScope.inputVisible =  true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });      
    },
    // 删除tag标签
    handleClose(i,newScope) {
      newScope.attr_vals.splice(i,1)
      this.redactTag(newScope)
    }
  },
  computed: {
    isBtnDisabled() {
      if(this.selectedKeys.length !== 3) return true
      return false
    },
    cateId() {
      if(this.selectedKeys.length !==3) return null
      return this.selectedKeys[this.selectedKeys.length - 1]
    },
    titleText() {
     return this.activeName === 'many' ?  '动态参数' :  '静态属性'
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin-top: 15px;
  }
  .el-tag {
    margin-right: 15px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>