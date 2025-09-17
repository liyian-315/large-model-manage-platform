<template>
  <div class="permission-menu-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state flex justify-center items-center py-8">
      <el-loading-spinner class="mr-2"></el-loading-spinner>
      <span class="text-gray-600">加载菜单中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state flex justify-center items-center py-8 text-danger">
      <el-icon class="mr-2"><WarningFilled /></el-icon>
      <span>{{ error }}</span>
    </div>

    <!-- 菜单组件 -->
    <el-menu
        v-else
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHierarchicalMenusByRoleId } from '@/api/user';
import {
  Menu,
  Document,
  Folder,
  WarningFilled
} from '@element-plus/icons-vue';
import { ElMenu, ElMenuItem, ElSubMenu, ElIcon} from 'element-plus';

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
const route = useRoute();
const router = useRouter();

// 当前激活的菜单
const activeMenu = computed(() => {
  // 这里可以根据实际路由与菜单的映射关系调整
  // 简单示例：使用当前路由的path作为激活标识
  return route.path || '';
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
  // 这里可以根据实际业务逻辑处理菜单点击
  // 示例：根据菜单ID或path导航
  const menu = findMenuById(processedMenus.value, parseInt(index));
  if (menu && menu.menuPath) {
    router.push(menu.menuPath);
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


// 组件挂载时加载菜单
onMounted(() => {
  loadMenus();
});
</script>

<style scoped>
.permission-menu-container {
  height: 100%;
  overflow-y: auto;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 240px;
  min-height: 400px;
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

