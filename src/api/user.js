import {post, put, get, del} from './index'

export function getPdfCopyWriting(params) {
    return get('/api/public/getPdfCW',params)
}


export function updatePersonInfo(params) {
    return put('/api/updatePersonInfo',params)
}

export async function registerUser(params) {
    return post('/api/auth/register',params)
}

export async function personInfo(params) {
    return post('/api/personInfo',params)
}

export async function login(params) {
    return post('/api/auth/login',params)
}

export const getHierarchicalMenusByRoleId = async (roleId) => {
   return get(`/api/sys/role-menu/hierarchical-menus/${roleId}`);
};

// 企业用户管理相关API
export const getUserList = async (params) => {
    return get('/api/enterprise/users', params);
};

export const createUser = async (data) => {
    return post('/api/enterprise/users', data);
};

export const updateUser = async (id, data) => {
    return put(`/api/enterprise/users/${id}`, data);
};

export const deleteUser = async (id) => {
    return del(`/api/enterprise/users/${id}`);
};

export const updateUserStatus = async (id, status) => {
    return put(`/api/enterprise/users/${id}/status`, { status });
};
