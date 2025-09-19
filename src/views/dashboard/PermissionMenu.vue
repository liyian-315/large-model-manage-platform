<template>
  <div class="main-container flex h-screen overflow-hidden">
    <!-- 左侧菜单区域 -->
    <div class="menu-container bg-slate-900 text-white border-r border-slate-700" :style="{ width: isCollapsed ? '60px' : '240px' }">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state flex justify-center items-center py-8">
        <el-loading-spinner class="mr-2"></el-loading-spinner>
        <span class="text-gray-600" v-if="!isCollapsed">加载菜单中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state flex justify-center items-center py-8 text-danger">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span v-if="!isCollapsed">{{ error }}</span>
      </div>

      <!-- 菜单组件 -->
      <el-menu
          v-else
          :default-active="activeMenu"
          class="el-menu-vertical-demo h-full"
          :collapse="isCollapsed"
          background-color="#0f172a"
          text-color="#94a3b8"
          active-text-color="#ffffff"
          :unique-opened="true"
          @select="handleMenuSelect"
      >
        <!-- 递归渲染菜单 -->
        <template v-for="menu in processedMenus" :key="menu.id">
          <!-- 有子菜单的项 -->
          <el-sub-menu
              v-if="menu.childMenu && menu.childMenu.length > 0"
              :index="menu.id.toString()"
          >
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>{{ menu.menuName }}</span>
            </template>

            <!-- 递归渲染子菜单 -->
            <template v-for="subMenu in menu.childMenu" :key="subMenu.id">
              <el-menu-item
                  v-if="!subMenu.childMenu || subMenu.childMenu.length === 0"
                  :index="subMenu.id.toString()"
              >
                <el-icon><Document /></el-icon>
                <span>{{ subMenu.menuName }}</span>
              </el-menu-item>

              <!-- 处理更深层级的子菜单 -->
              <el-sub-menu
                  v-else
                  :index="subMenu.id.toString()"
              >
                <template #title>
                  <el-icon><Folder /></el-icon>
                  <span>{{ subMenu.menuName }}</span>
                </template>
                <template v-for="deepMenu in subMenu.childMenu" :key="deepMenu.id">
                  <el-menu-item
                      :index="deepMenu.id.toString()"
                  >
                    <el-icon><Document /></el-icon>
                    <span>{{ deepMenu.menuName }}</span>
                  </el-menu-item>
                </template>
              </el-sub-menu>
            </template>
          </el-sub-menu>

          <!-- 无子菜单的项 -->
          <el-menu-item
              v-else
              :index="menu.id.toString()"
          >
            <el-icon><Document /></el-icon>
            <span>{{ menu.menuName }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- 右侧内容区域：子路由容器（嵌套路由核心，渲染子路由组件） -->
    <div class="content-container flex-1 overflow-auto bg-slate-50">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // 路由核心API
import { getHierarchicalMenusByRoleId } from '@/api/user';
import { Menu, Document, Folder, WarningFilled } from '@element-plus/icons-vue';

// 1. 接收父组件传入的折叠状态（保持原有逻辑）
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

// 2. 路由实例初始化（嵌套路由核心依赖）
const router = useRouter();
const route = useRoute();

// 3. 状态管理（删除原动态组件相关状态：currentComponent、loadingContent等）
const loading = ref(true);
const error = ref('');
const rawMenus = ref([]);
const currentMenu = ref(null); // 仅用于临时存储当前点击菜单
// 从localStorage获取当前登录用户的roleId，转换为数字类型
//const currentRoleId = ref(Number(localStorage.getItem('roleId') || 0));
const currentRoleId = ref(1);
// 4. 处理菜单数据（保持过滤、排序、递归逻辑，新增menuPath校验）
const processedMenus = computed(() => {
  if (!Array.isArray(rawMenus.value)) return [];

  // 深拷贝避免修改原始数据
  const menus = JSON.parse(JSON.stringify(rawMenus.value));

  // 递归过滤（显示状态）、排序（排序号）、补全子菜单
  const filterAndSort = (menuList) => {
    return menuList
        .filter(menu => menu.isShow === 1 && menu.menuPath) // 新增menuPath校验（避免无路由的无效菜单）
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        .map(menu => ({
          ...menu,
          childMenu: filterAndSort(menu.childMenu || [])
        }));
  };

  return filterAndSort(menus);
});

// 5. 核心：菜单激活状态（与当前子路由路径同步）
const activeMenu = computed(() => {
  // 根据当前路由全路径（如/home/1）查找对应的菜单ID
  const matchedMenu = findMenuByPath(processedMenus.value, route.fullPath);
  return matchedMenu ? matchedMenu.id.toString() : '';
});

// 6. 菜单选择事件（替换原动态组件逻辑，改为路由跳转）
const handleMenuSelect = (index) => {
  const menu = findMenuById(processedMenus.value, parseInt(index));
  console.log('点击的菜单:', menu);

  // 若菜单有路由路径，跳转到对应的子路由（如/home/1）
  if (menu && menu.id) {
    currentMenu.value = menu;
    router.push(`/system/${menu.id}`); // 路由跳转核心代码
  }
};

// 7. 辅助方法：根据ID查找菜单（递归）
const findMenuById = (menus, id) => {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.childMenu && menu.childMenu.length) {
      const found = findMenuById(menu.childMenu, id);
      if (found) return found;
    }
  }
  return null;
};

// 8. 辅助方法：根据路由路径查找菜单（用于激活状态同步）
const findMenuByPath = (menus, targetPath) => {
  for (const menu of menus) {
    // 匹配菜单的路由路径与当前路由路径（如/home/1）
    if (menu.menuPath === targetPath) {
      return menu;
    }
    // 递归查找子菜单
    if (menu.childMenu && menu.childMenu.length) {
      const found = findMenuByPath(menu.childMenu, targetPath);
      if (found) return found;
    }
  }
  return null;
};

// 9. 加载菜单数据（新增路由初始化逻辑：默认跳第一个有效菜单）
const loadMenus = async () => {
  if (!currentRoleId.value) {
    error.value = '未获取到用户角色ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const response = await getHierarchicalMenusByRoleId(currentRoleId.value);
    console.log('接口返回的菜单数据:', response);

    if (Array.isArray(response.data)) {
      // 验证菜单数据结构（新增menuPath校验，确保路由可用）
      const isValid = response.data.every(menu =>
          menu.id !== undefined &&
          menu.menuName &&
          typeof menu.isShow === 'number' &&
          menu.menuPath // 必须包含路由路径
      );

      if (isValid) {
        rawMenus.value = response.data;
        error.value = '';

        // 初始化：若当前路由是父路由根路径（/home），默认跳第一个有效菜单
        if (processedMenus.value.length > 0 && route.fullPath === '/home') {
          const firstMenu = getFirstValidMenu(processedMenus.value);
          if (firstMenu && firstMenu.menuPath) {
            router.push(firstMenu.menuPath);
          }
        }
      } else {
        error.value = '菜单数据结构不完整（缺少id/menuName/isShow/menuPath）';
        console.error('菜单数据验证失败:', response);
      }
    } else {
      error.value = '接口返回数据不是数组';
      console.error('接口返回格式错误:', response);
    }
  } catch (err) {
    error.value = err.message || '加载菜单失败，请重试';
    console.error('加载菜单出错:', err);
  } finally {
    loading.value = false;
  }
};

// 10. 辅助方法：获取第一个可点击的菜单（用于初始化跳转）
const getFirstValidMenu = (menus) => {
  for (const menu of menus) {
    // 优先选择无子菜单的菜单（叶子节点，有明确路由）
    if (!menu.childMenu || menu.childMenu.length === 0) {
      return menu;
    }
    // 递归查找子菜单的第一个叶子节点
    const firstChild = getFirstValidMenu(menu.childMenu);
    if (firstChild) return firstChild;
  }
  return null;
};

// 11. 监听路由变化：同步菜单激活状态（路由回退/前进时生效）
watch(
    () => route.fullPath,
    (newPath) => {
      // 路由变化时，通过findMenuByPath更新currentMenu，进而同步activeMenu
      currentMenu.value = findMenuByPath(processedMenus.value, newPath) || null;
    },
    { immediate: true } // 初始渲染时立即执行
);

// 12. 组件挂载时加载菜单
onMounted(() => {
  loadMenus();
});
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.menu-container {
  transition: width 0.3s ease;
  overflow: hidden;
}

.content-container {
  flex: 1;
  overflow: auto;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
  min-height: 100%;
}

.loading-state, .error-state {
  font-size: 14px;
  height: 60px;
}

/* 自定义菜单样式 */
::v-deep .el-menu {
  border-right: none;
}

::v-deep .el-sub-menu__title,
::v-deep .el-menu-item {
  height: 50px;
  line-height: 50px;
  transition: all 0.2s;
}

::v-deep .el-menu-item.is-active {
  background-color: #165dff !important;
}

::v-deep .el-sub-menu__title:hover,
::v-deep .el-menu-item:hover {
  background-color: #1e293b !important;
}

::v-deep .el-menu--collapse .el-sub-menu__title span {
  display: none;
}

::v-deep .el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}
</style>
