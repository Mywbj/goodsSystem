<template>
  <div>
    <!-- 面包屑 -->
    <crumbs :arr-data="['用户管理', '用户列表']"></crumbs>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="15">
        <el-col :span="10">
           <el-input placeholder="请输入内容" v-model="infoQuery.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    <!-- 用户表格区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽的使用 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>            
          </template>

        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改信息" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUsers(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>                        
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>                        
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!-- @size-change监听选中显示多少条触发
      @current-change监听页码改变触发
      :current-page 去到第几页
      :page-size 设置一页中显示多少条数据
      :total 设置一共有多少数据
       -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="infoQuery.pagenum" 
        :page-sizes="[1, 2, 5, 10]"
        :page-size="infoQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!-- 添加用户区域 -->
      <el-dialog title="添加用户"
        :visible.sync="addDialogVisible"
        width="40%">
           <!-- 添加用户的form表单 -->
        <el-form ref="addFormRef" :rules="addFormRules" :model="addUserForm" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogMover">取 消</el-button>
          <el-button type="primary" @click="addUsers">确 定</el-button>
        </span>
      </el-dialog>  
      <!-- 修改用户信息的表单 -->
      <el-dialog title="修改用户信息"
        :visible.sync="deitDialogVisible"
        width="40%">
           <!-- 修改用户信息的form表单 -->
        <el-form ref="deitFormRef" :rules="deitFormRules" :model="deitUserForm" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="deitUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="deitUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="deitUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="deitDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="amendUsers">确 定</el-button>
          </span>
      </el-dialog>
      <!-- 分配用户角色 -->
      <el-dialog title="分配角色"
        :visible.sync="setDialogVisible" width="30%">
        <div>
          <p>当前用户：{{userInfo.username}}</p>
          <p>当前角色：{{userInfo.role_name}}</p>
          <p>
            分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleRole"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>            
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>   
    </el-card>
  </div>
</template>
<script>
import {request} from '../../network/axios'
import {CrumbsMixin} from '../../common/mixin'
export default {
  name: 'Users',
  components: {
    // Crumbs
  },
  mixins: [CrumbsMixin],
  data() {
    return {
      // 网络请求
      infoQuery: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 获取用户列表
      userList: [],
      // 获取一共有多少条数据
      total: 0,
      // 添加用户框是否显示
      addDialogVisible: false, // 是否弹出
      // 修改用户信息框是否显示
      deitDialogVisible: false,
      // 添加表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名长度3~10字符之间'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名长度6~15字符之间'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          // 这个只能验证手机号
          { pattern:/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: "请输入正确的手机号/电话号", trigger: ['blur', 'change'] }
        ]
      },
      // 修改用户的表单验证
      deitFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          // 这个只能验证手机号
          { pattern:/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: "请输入正确的手机号/电话号", trigger: ['blur', 'change'] }
        ]
      },
      // 修改用户的信息对象
      deitUserForm: {
        email: '',
        mobile: ''
      },
      // 分配用户角色
      setDialogVisible: false,
      // 分配角色的id
      setRoleId: '',
      // 需要被分配用户的信息
      userInfo: {},
      // 所有角色的数据列表
      roleRole: [],
      // 已选中的角色值
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户数据列
    getUsersList() {
      request({
        url: 'users',
        params: this.infoQuery
      }).then(res => {
        if(res.data.meta.status !== 200) return this.$message.error({message: '获取用户数据列表失败！', center:true})
        this.userList = res.data.data.users
        this.total = res.data.data.total
      })
    },
    // 监听 page-sizes 改变的事件
    handleSizeChange(newSize) {
      this.infoQuery.pagesize = newSize
      this.getUsersList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.infoQuery.pagenum = newPage
      this.getUsersList()
    },
    // 是否打开状态
    userStateChange(infoState) {
      request({
        url: `users/${infoState.id}/state/${infoState.mg_state}`,
        method: 'put'
      }).then(({data:{data,meta}}) => {
        console.log(data)
        console.log(meta)
        if(meta.status !== 200) {
          infoState.mg_stat = !infoState.mg_stat
          return this.$message.error({message: meta.msg, center: true})
        }
        this.$message.success({message: meta.msg, center: true})
      })
    },
    // 点击取消去掉表单中所有内容
    addDialogMover() {
      // resetFields() 去掉表单中所有内容
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 添加用户
    addUsers() {
      this.$refs.addFormRef.validate(valid => {
        if(!valid) return
        request({
          url: 'users',
          params: this.addUserForm,
          method: 'post'
        }).then(({data:{data, meta}}) => {
          if(meta.status !== 201) {
            return this.$message.error({message: '创建用户失败', center: true})
          }
          this.$message.success({message: '创建用户成功', center: true})
          this.getUsersList()
          this.addDialogVisible = false
        })
      })
    },
    // 获取修改用户信息数据
    editUsers(id) {
      this.deitDialogVisible = true
      request({
        url: 'users/'+ id
      }).then(({data:res}) => {
        console.log(res)
        this.deitUserForm = res.data
      })
    },
    // 确定修改用户信息
    amendUsers() {
      this.$refs.deitFormRef.validate(valid => {
        request({
          url: 'users/' + this.deitUserForm.id,
          params: {
            email: this.deitUserForm.email,
            mobile: this.deitUserForm.mobile
          },
          method: 'put'
        }).then(({data:{data,meta}}) => {
          if(meta.status !== 200) return this.$message.error({message: meta.msg, center: true})
          this.getUsersList()
          this.deitDialogVisible = false
          this.$refs.deitFormRef.resetFields()
        })
      })
    },
    // 删除单个用户
    deleteUser(id) {
      this.$messageBox('是否永久删除该用户 ?',  '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        request({
          url: 'users/' + id,
          method: 'delete' 
        }).then(({data:{meta}}) => {
          if(meta.status !== 200) return this.$message.error({message: meta.msg, center: true})
            this.$message.success({message: meta.msg, center: true})
            this.getUsersList()
        })
      }).catch(err => {
        this.$message.info({message: '已取消',center: true})
      })
    },
    // 分配角色
    setRole(scopeRow) {
      this.setRoleId = scopeRow.id
      this.userInfo = scopeRow
      this.$axios({
        url: 'roles'
      }).then(({data:res}) => {
        console.log(res)
        this.roleRole = res.data
      })
      this.setDialogVisible = true
    },
    // 点击按钮 分配角色
    saveRoleInfo() {
      if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色！')
      this.$axios({
        url: `users/${this.userInfo.id}/role`,
        params: {rid: this.selectedRoleId},
        method: 'put'
      }).then(({data:res}) => {
        console.log(res)
        if(res.meta.status !== 200) return this.$message.error('设置角色失败！')
        this.$message.success('设置角色成功')
        this.getUsersList()
        this.setDialogVisible = false
      })
    }
  },
  created() {
    this.getUsersList()
  }
}
</script>

<style lang="less">
  .el-breadcrumb {
    margin-bottom: 15px;
  }
  .el-card {
    box-shadow: 0 1px 1px rgba(0, 0, 0, .15) !important;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>