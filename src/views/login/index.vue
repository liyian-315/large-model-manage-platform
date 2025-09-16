<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="header">
        <h2>用户登录</h2>
      </div>

      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" @click="submitForm">登录</el-button>
          <el-button type="text" @click="goToRegister">去注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { login } from '@/api/user.js'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 跳转到注册页面
function goToRegister() {
  router.push('/register')
}

// 提交登录表单
async function submitForm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const response = await login(form.value)

    if (response && response.token) {
      const { token, username, role } = response;
      // 存储 Token 和用户信息
      localStorage.setItem('token', token.trim());
      localStorage.setItem('username', (username || '').trim());
      localStorage.setItem('role', (role || '').trim());

      ElMessage.success('登录成功');
      if (window.updateLoginStatus) {
        window.updateLoginStatus()
      }
      const redirect = route.query.redirect || '/';
      await router.push(redirect);
    } else {
      console.error('登录失败：未获取到有效 Token');
    }
  } catch (error) {
    if (error.name !== 'Error') return;
    ElMessage.error('登录失败: ' + (error.message || '用户名或密码错误'));
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px - 180px);
  background-color: #f5f7fa;
  padding: 110px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

h2 {
  color: #1f2329;
  font-size: 20px;
}

.login-form {
  padding: 0 20px 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}
</style>
