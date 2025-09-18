<template>
  <div class="app-wrapper">

    <main>
      <router-view/>
    </main>
  </div>
</template>

<script setup>
import 'element-plus/dist/index.css'
import {useRouter, useRoute} from 'vue-router'
import {ref, watch, onMounted, onUnmounted} from "vue";

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path === '/' ? '' : route.path)
const isLoggedIn = ref(false)

function checkLoginStatus() {
  isLoggedIn.value = !!localStorage.getItem('token')
}

onMounted(() => {
  document.body.classList.add('page-loaded')
  checkLoginStatus()

  window.addEventListener('storage', checkLoginStatus)
})


onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus)
})

watch(
    () => route.path,
    (newPath) => {
      activeMenu.value = newPath === '/' ? '' : newPath
    }
)
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}
.logo i {
  color: white;
  font-size: 36px;
}

.app-footer p {
  color: #718096;
  font-size: 14px;
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

</style>

<!--<template>-->
<!--  <div id="app">-->
<!--    &lt;!&ndash; 直接引入权限菜单组件作为根组件 &ndash;&gt;-->
<!--    <router-view/>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--// 导入权限菜单组件-->
<!--import PermissionMenu from './views/dashboard/PermissionMenu.vue';-->
<!--</script>-->

<!--<style>-->
<!--/* 基础样式设置 */-->
<!--* {-->
<!--  margin: 0;-->
<!--  padding: 0;-->
<!--  box-sizing: border-box;-->
<!--}-->

<!--#app {-->
<!--  font-family: Avenir, Helvetica, Arial, sans-serif;-->
<!--  -webkit-font-smoothing: antialiased;-->
<!--  -moz-osx-font-smoothing: grayscale;-->
<!--  min-height: 100vh;-->
<!--}-->
<!--</style>-->
