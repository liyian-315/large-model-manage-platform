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

    <!-- 右侧内容区域 -->
    <div class="content-container flex-1 overflow-auto bg-slate-50">
      <div v-if="loadingContent" class="flex h-full justify-center items-center">
        <el-loading-spinner class="mr-2"></el-loading-spinner>
        <span class="text-gray-600">加载内容中...</span>
      </div>

      <div v-else-if="contentError" class="flex h-full justify-center items-center text-danger">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span>{{ contentError }}</span>
      </div>

      <div v-else class="p-6">
        <!-- 动态组件渲染 -->
        <component
            :is="currentComponent"
            :key="currentComponentKey"
        ></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getHierarchicalMenusByRoleId } from '@/api/user';
import {
  Menu,
  Document,
  Folder,
  WarningFilled
} from '@element-plus/icons-vue';

// 导入页面组件
import UserManagement from '@/views/enterprise/UserManagement.vue';
// 可以在这里导入更多组件
// import Dashboard from '@/views/Dashboard.vue';
// import Settings from '@/views/Settings.vue';

// 路径与组件的映射表
const pathComponentMap = {
  // 路径1对应UserManagement组件
  '1': UserManagement,
  // 可以添加更多路径映射
  // 'dashboard': Dashboard,
  // 'system-settings': Settings
};

// 接收父组件传入的折叠状态
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

// 状态管理
const loading = ref(true);
const error = ref('');
const rawMenus = ref([]);

// 内容区域状态
const currentMenu = ref(null);
const currentComponent = ref(null);
const currentComponentKey = ref(0);
const loadingContent = ref(false);
const contentError = ref('');

// 当前激活的菜单
const activeMenu = computed(() => {
  if (currentMenu.value) {
    return currentMenu.value.id.toString();
  }
  return '';
});

// 测试用角色ID
const currentRoleId = ref(1);

// 处理菜单数据
const processedMenus = computed(() => {
  if (!Array.isArray(rawMenus.value)) return [];

  // 深拷贝避免修改原始数据
  const menus = JSON.parse(JSON.stringify(rawMenus.value));

  // 递归过滤和排序
  const filterAndSort = (menuList) => {
    return menuList
        .filter(menu => menu.isShow === 1) // 只显示需要展示的菜单
        .sort((a, b) => (a.sort || 0) - (b.sort || 0)) // 按排序号排序
        .map(menu => ({
          ...menu,
          childMenu: filterAndSort(menu.childMenu || []) // 处理子菜单
        }));
  };

  return filterAndSort(menus);
});

// 菜单选择事件处理
const handleMenuSelect = (index) => {
  const menu = findMenuById(processedMenus.value, parseInt(index));
  console.log('点击的菜单:', menu);

  if (menu && menu.menuPath) {
    currentMenu.value = menu;
    loadComponent(menu.menuPath);
  }
};

// 加载对应的组件
const loadComponent = (path) => {
  try {
    loadingContent.value = true;
    contentError.value = '';

    // 从映射表中获取对应的组件
    if (pathComponentMap[path]) {
      currentComponent.value = pathComponentMap[path];
      currentComponentKey.value++; // 强制重新渲染组件
    } else {
      contentError.value = `未找到路径为 ${path} 的对应组件`;
      console.error(`路径 ${path} 没有对应的组件映射`);
      currentComponent.value = null;
    }
  } catch (err) {
    contentError.value = `加载组件失败: ${err.message}`;
    console.error('加载组件出错:', err);
    currentComponent.value = null;
  } finally {
    loadingContent.value = false;
  }
};

// 根据ID查找菜单
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

// 加载菜单数据
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

    if (Array.isArray(response)) {
      // 验证菜单数据结构
      const isValid = response.every(menu =>
          menu.id !== undefined && menu.menuName && typeof menu.isShow === 'number'
      );

      if (isValid) {
        rawMenus.value = response;
        error.value = '';

        // 默认加载第一个菜单
        if (processedMenus.value.length > 0) {
          const firstMenu = getFirstValidMenu(processedMenus.value);
          if (firstMenu) {
            handleMenuSelect(firstMenu.id.toString());
          }
        }
      } else {
        error.value = '菜单数据结构不完整';
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

// 获取第一个可点击的菜单
const getFirstValidMenu = (menus) => {
  for (const menu of menus) {
    if (!menu.childMenu || menu.childMenu.length === 0) {
      return menu;
    }
    const firstChild = getFirstValidMenu(menu.childMenu);
    if (firstChild) return firstChild;
  }
  return null;
};

// 组件挂载时加载菜单
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
