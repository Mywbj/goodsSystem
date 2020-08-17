<template>
  <div class="login">
    <!-- 大盒子 -->
    <div class="login-box">
      <!-- logo区域 -->
      <div class="login-logo">
        <img src="../../assets/logo.png">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="refForm" :rules="rules" :model="form" class="login-form">
        <!-- 账号区域 -->
        <el-form-item prop="username">
          <el-input v-model="form.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {request} from '../../network/axios'
export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      this.$refs.refForm.resetFields()
    },
    // 登录
    login() {
      this.$refs.refForm.validate(/*async*/ inf => {
        // if(!inf) return
        // const {data} = await this.$axios.post('login',this.form)
        // if(data.meta.status !== 200) return console.log('登录失败')
        // console.log(data,'登录成功')

        request({
          url: 'login', 
          params: this.form
          }).then(({data}) => {
          if(data.meta.status !== 200) return this.$message.error({message:'登录失败！',center:true})
          this.$message.success({message: '登录成功！', center: true})
          sessionStorage.setItem('token', data.data.token)
          this.$router.push('/home')
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .login {
    height: 100%;
    background: #274A6C;
  }
  .login-box {
    width: 450px;
    height: 300px;
    background: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .login-logo {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      border: 1px solid #eee;
      box-shadow: 0 0 10px #eee;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #eee;
      }
    }
  }
  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 25px;
    box-sizing: border-box;
    .btns {
      display: flex;
      justify-content: center;
    }
  }
</style>