<script setup>
// 导入Login组件
import Login from './views/login/index.vue'
import { onMounted } from 'vue'

// 添加页面加载动画效果
onMounted(() => {
  document.body.classList.add('page-loaded')
})
</script>

<template>
  <div class="app-container">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 系统标题区域 -->
    <div class="system-header">
      <div class="logo">
        <i class="fa fa-cubes"></i>
      </div>
      <h1 class="system-title">企业管理系统</h1>
      <p class="system-subtitle">高效、安全的企业管理解决方案</p>
    </div>

    <!-- 登录组件 -->
    <div class="login-wrapper">
      <Login />
    </div>

    <!-- 页脚信息 -->
    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} 企业管理系统 版权所有</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 - 确保全屏显示 */
html, body {
  height: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f0f2f5;
  transition: background-color 0.5s ease;
  opacity: 0;
}

body.page-loaded {
  opacity: 1;
  transition: opacity 0.8s ease;
}

/* 应用容器 - 确保占满整个屏幕 */
.app-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(102, 16, 242, 0.05));
  filter: blur(80px);
  animation: float 20s infinite ease-in-out;
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

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}

/* 系统标题区域 */
.system-header {
  text-align: center;
  margin-bottom: 40px;
  z-index: 1;
  animation: fadeInDown 0.8s ease forwards;
  opacity: 0;
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

/* 登录组件容器 */
.login-wrapper {
  z-index: 1;
  animation: fadeInUp 0.8s ease 0.2s forwards;
  opacity: 0;
  transform: translateY(20px);
  width: 100%;
  max-width: 400px; /* 控制登录框最大宽度 */
}

/* 页脚信息 */
.app-footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  z-index: 1;
  animation: fadeIn 1s ease 0.4s forwards;
  opacity: 0;
}

.app-footer p {
  color: #718096;
  font-size: 14px;
}

/* 动画效果 */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .system-title {
    font-size: 26px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .logo i {
    font-size: 28px;
  }

  .bg-circle {
    transform: scale(0.7);
  }

  .system-header {
    margin-bottom: 20px;
  }
}

/* 确保登录页面内容不会被挤压 */
@media (max-height: 600px) {
  .app-footer {
    position: relative;
    margin-top: 30px;
    bottom: auto;
  }

  .system-header {
    margin-bottom: 15px;
  }
}
</style>
