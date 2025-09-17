<template>
  <li class="menu-item" :class="{ 'has-children': menu.childMenu && menu.childMenu.length > 0 }">
    <!-- 菜单项内容 -->
    <div
        class="menu-link flex items-center px-4 py-3 cursor-pointer transition-all"
        :class="{
        'bg-primary/10 text-primary': isActive,
        'hover:bg-gray-100': !isActive
      }"
        @click="handleClick"
    >
      <!-- 菜单图标 -->
      <i class="menu-icon fa" :class="menu.icon || 'fa-circle-o'"></i>

      <!-- 菜单名称（折叠时隐藏） -->
      <span v-if="!isCollapsed" class="menu-name ml-3 flex-1">{{ menu.menuName }}</span>

      <!-- 子菜单指示器（有子菜单且未折叠时显示） -->
      <i
          v-if="hasChildren && !isCollapsed"
          class="menu-arrow fa"
          :class="isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"
      ></i>
    </div>

    <!-- 子菜单 -->
    <ul
        v-if="hasChildren && isExpanded"
        class="submenu"
        :style="{ paddingLeft: depth > 0 ? (depth * 24) + 'px' : '16px' }"
    >
      <template v-for="child in menu.childMenu" :key="child.id">
        <MenuItem
            :menu="child"
            :is-collapsed="isCollapsed"
            :depth="depth + 1"
        />
      </template>
    </ul>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 接收父组件传入的参数
const props = defineProps({
  menu: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0
  }
});

const route = useRoute();
const router = useRouter();

// 判断是否有子菜单
const hasChildren = computed(() => {
  return props.menu.childMenu && props.menu.childMenu.length > 0;
});

// 判断当前菜单是否为激活状态
const isActive = computed(() => {
  // 如果有子菜单，判断子菜单是否有激活状态
  if (hasChildren.value) {
    return props.menu.childMenu.some(child => {
      return route.path.includes(child.menuPath);
    });
  }
  // 无子菜单，直接判断当前路径
  return route.path === props.menu.menuPath;
});

// 子菜单展开状态
const isExpanded = ref(false);

// 初始化时，如果是激活状态则展开
if (isActive.value) {
  isExpanded.value = true;
}

// 处理菜单项点击
const handleClick = () => {
  // 有子菜单则切换展开状态
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
  }
  // 无子菜单且有路径则导航
  else if (props.menu.menuPath) {
    router.push(props.menu.menuPath).catch(err => {
      // 忽略导航重复的错误
      if (!err.message.includes('Avoided redundant navigation')) {
        console.error('导航错误:', err);
      }
    });
  }
};
</script>

<style scoped>
.menu-item {
  position: relative;
}

.menu-link {
  color: #333;
  font-size: 14px;
}

.menu-icon {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.submenu {
  list-style: none;
  margin: 0;
  background-color: #f9f9f9;
}

.submenu .menu-link {
  padding-top: 2px;
  padding-bottom: 2px;
  font-size: 13px;
}

/* 选中状态样式 */
.menu-link.bg-primary\/10 {
  font-weight: 500;
}

/* 悬停效果 */
.menu-link:hover {
  background-color: #f5f5f5;
}
</style>
