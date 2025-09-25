import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'
import UserManagement from '@/views/dashboard/UserManagement.vue'
import RoleManagement from '@/views/dashboard/RoleManagement.vue'
import EnterpriseUserManagement from "@/views/enterprise/EnterpriseUserManagement.vue";
import AIServerManagement from "@/views/enterprise/AIServerManagement.vue";
import OpenSourceLLMList from "@/views/enterprise/OpenSourceLLMList.vue";
const routes = [
    // 1. 根路径默认重定向到登录页
    { path: '/', redirect: '/login' },
    // 2. 登录页（无需登录）
    { path: '/login', component: Login, meta: { requireAuth: false } },
    // 3. 注册页（无需登录）
    { path: '/register', component: Register, meta: { requireAuth: false } },
    {
        path: '/system-admin',
        component: () => import("@/views/dashboard/PermissionMenu.vue"),
        children:[
            {
                path:'user',
                component:UserManagement,
                meta: {title: '企业用户管理'}
            },
            {
                path:'role',
                component:RoleManagement,
                meta: {title: '用户角色管理'}
            },
        ]
    },
    {
        path: '/enterprise-admin',
        component: () => import("@/views/dashboard/PermissionMenu.vue"),
        children:[
            {
                path:'user',
                component:EnterpriseUserManagement,
                meta: {title: '企业业务操作员管理'}
            },
            {
                path: 'server',
                component: AIServerManagement,
            },
            {
                path: 'opensourceLLMs',
                component: OpenSourceLLMList,
            }
        ]
    }


]

export default createRouter({
    history: createWebHistory(),
    routes
})
12
