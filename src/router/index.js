import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'
const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
]

export default createRouter({
    history: createWebHistory(),
    routes
})
