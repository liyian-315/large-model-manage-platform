<template>
  <div class="login-container">
    <div class="bg-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <div class="system-header">
      <div class="logo">
        <i class="fa fa-cubes"></i>
      </div>
      <h1 class="system-title">企业管理系统</h1>
      <p class="system-subtitle">高效、安全的企业管理解决方案</p>
    </div>

    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">用户登录</h2>
        <p class="login-desc">请输入账号信息以继续</p>
      </div>

      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username" class="form-item-large">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" class="form-item-large">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large"></el-input>
        </el-form-item>
        <el-form-item class="form-actions" label-width="0">
          <el-button type="primary" @click="submitForm" size="large">登录</el-button>
          <el-button type="text" @click="goToRegister" size="large">去注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
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

function goToRegister() {
  router.push('/register')
}

async function submitForm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const response = await login(form.value)
    console.log(response)
    if (response.data && response.data.token) {
      const { token, username, roleName, roleId} = response.data;
      console.log("当前登录用户角色是，role:", roleName);
      localStorage.setItem('token', token.trim());
      localStorage.setItem('username', (username || '').trim());
      localStorage.setItem('roleName', (roleName || '').trim());
      localStorage.setItem('roleId', (roleId.toString() || '').trim());
      ElMessage.success('登录成功');
      if (window.updateLoginStatus) {
        window.updateLoginStatus()
      }
      const redirect = route.query.redirect || `/${roleName}`;
      await router.push(redirect);
    } else {
      console.error('登录失败：未获取到有效 Token');
      ElMessage.error('登录失败：未获取到有效信息');
    }
  } catch (error) {
    ElMessage.error('登录失败: ' + (error.message || '用户名或密码错误'));
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 0 15px;
  background-color: #f5f7fa;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.15), rgba(102, 16, 242, 0.1));
  filter: blur(80px);
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, 30px) scale(1.05); }
  50% { transform: translate(0, 50px) scale(1); }
  75% { transform: translate(-30px, 30px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -300px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 500px;
  height: 500px;
  bottom: -250px;
  right: -150px;
  animation-delay: 5s;
}

.circle-3 {
  width: 400px;
  height: 400px;
  top: 30%;
  right: 10%;
  animation-delay: 10s;
}

.system-header {
  position: relative;
  text-align: center;
  margin-bottom: 50px;
  z-index: 1;
  animation: fadeInDown 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4299e1, #6610f2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(66, 153, 225, 0.3);
}

.logo i {
  color: white;
  font-size: 36px;
}

.system-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 10px;
}

.system-subtitle {
  font-size: 16px;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 40px 50px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  border-radius: 12px;
  z-index: 2;
  animation: fadeInUp 0.8s ease forwards 0.2s;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card:hover {
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
  transform: translateY(-3px);
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 12px;
}

.login-desc {
  font-size: 16px;
  color: #718096;
}

.login-form {
  width: 100%;
}

.form-item-large {
  margin-bottom: 25px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 35px;
  gap: 20px;
}

.form-actions .el-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .login-card {
    width: 100%;
    padding: 30px 25px;
  }

  .login-title {
    font-size: 24px;
  }

  .system-title {
    font-size: 28px;
  }

  .logo {
    width: 70px;
    height: 70px;
  }

  .logo i {
    font-size: 30px;
  }
}

@media (max-height: 600px) {
  .login-container {
    align-items: flex-start;
    padding-top: 30px;
  }

  .system-header {
    margin-bottom: 30px;
  }

  .login-card {
    padding: 25px 20px;
  }

  .login-header {
    margin-bottom: 25px;
  }
}
</style>
