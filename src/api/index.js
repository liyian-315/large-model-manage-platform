import axios from 'axios'
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

const apiClient = axios.create({
    baseURL: '/',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
    response => {
        const res = response.data;
        const httpStatus = response.status;
        // -------------------------- 1. 处理成功场景（HTTP 2xx 系列）--------------------------
        if (httpStatus >= 200 && httpStatus < 300) {
            if (typeof res === 'object' && res !== null && 'data' in res) {
                if(res.code >= 400){
                    ElMessage.warning(res.message)
                }
                return res;
            }
            return res;
        }

        // -------------------------- 2. 处理客户端错误（HTTP 4xx 系列）--------------------------
        if (httpStatus >= 400 && httpStatus < 500) {
            let errorMsg = '';
            // 401：未授权（Token 过期/缺失），强制跳转登录
            if (httpStatus === 401) {
                localStorage.removeItem('token');
                if (router.currentRoute.value.path !== '/login') {
                    router.push('/login');
                    ElMessage.error('登录已过期或 Token 无效，请重新登录');
                }
                errorMsg = '登录已过期或 Token 无效，请重新登录';
            }
            // 400：参数错误（后端返回的错误信息优先）
            else if (httpStatus === 400) {
                errorMsg = res?.message || '参数错误，请检查请求参数';
            }
            // 404：资源不存在
            else if (httpStatus === 404) {
                errorMsg = '请求的资源不存在';
            }
            // 其他 4xx 错误
            else {
                errorMsg = `客户端错误（${httpStatus}）：${res?.message || '操作失败'}`;
            }
            ElMessage.error(errorMsg);
            return Promise.reject(new Error(errorMsg));
        }

        // -------------------------- 3. 处理服务器错误（HTTP 5xx 系列）--------------------------
        if (httpStatus >= 500 && httpStatus < 600) {
            const errorMsg = `服务器错误（${httpStatus}）：${res?.message || '服务器内部异常，请稍后重试'}`;
            ElMessage.error(errorMsg);
            return Promise.reject(new Error(errorMsg));
        }

        // -------------------------- 4. 其他未定义状态码 --------------------------
        const errorMsg = `未知错误（${httpStatus}）：${res?.message || '操作失败'}`;
        ElMessage.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    },
    error => {
        let errorMsg = '';
        // 关键补充：判断是否有后端响应（如 401/500 但跨域配置导致进入 error 回调）
        if (error.response) {
            const httpStatus = error.response.status;
            const res = error.response.data;
            // 处理 401：未授权（此时需执行跳转登录）
            if (httpStatus === 401) {
                localStorage.removeItem('token');
                if (router.currentRoute.value.path !== '/login') {
                    router.push('/login');
                    errorMsg = '登录已过期或 Token 无效，请重新登录';
                }
            }
            // 处理其他有响应的错误（如 404/500）
            else if (httpStatus >= 400 && httpStatus < 500) {
                errorMsg = `客户端错误（${httpStatus}）：${res?.message || '操作失败'}`;
            } else if (httpStatus >= 500) {
                errorMsg = `服务器错误（${httpStatus}）：${res?.message || '服务器内部异常'}`;
            }
        }
        // 无响应场景（如网络中断、后端宕机）
        else if (error.request) {
            errorMsg = '请求无响应，请检查后端服务是否正常或网络是否通畅';
        }
        // 请求发送前的错误（如参数错误、超时）
        else {
            errorMsg = error.message || '请求发送失败，请检查请求配置';
        }
        ElMessage.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }
)


export function get(url, params = {}) {
    return apiClient.get(url, { params })
}

export function post(url, data, config) {
    return apiClient.post(url, data, config)
}

export function put(url, data, config) {
    return apiClient.put(url, data, config)
}

export function del(url, params = {}) {
    return apiClient.delete(url, { params })
}
