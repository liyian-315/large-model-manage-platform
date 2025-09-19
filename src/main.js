import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue';

const app = createApp(App)

// @ts-ignore
app.component('Plus', Plus)
// @ts-ignore
app.component('Edit', Edit)
// @ts-ignore
app.component('Delete', Delete)
// @ts-ignore
app.component('Download', Download)

app.use(router)
app.use(ElementPlus)
app.mount('#app')