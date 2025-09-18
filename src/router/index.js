import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'
import UserManagement from '@/views/enterprise/UserManagement.vue'

const routes = [
    {
        path: '/',
        component: () => import("@/views/dashboard/PermissionMenu.vue"),
        children:[
            {
                path:'1',
                component:UserManagement,
                meta: {title: '企业用户管理'}
            }
        ]
    },
    {path: '/register', component: Register},
]

export default createRouter({
    history: createWebHistory(),
    routes
})
