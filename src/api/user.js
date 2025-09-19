import {post, put, get, del} from './index'

export async function registerUser(params) {
    return post('/api/auth/register',params)
}

export async function login(params) {
    return post('/api/sys/user/login',params)
}

// 根据用户角色id获取菜单
export const getHierarchicalMenusByRoleId = async (roleId) => {
   return get(`/api/sys/role-menu/hierarchical-menus/${roleId}`);
};

// 用户管理相关API
export const getUserList = async (params) => {
    return post('/api/sys/user/page', params);
};

// 以下尚未实现
export const createUser = async (data) => {
    return post('/api/sys/user', data);
};

export const updateUser = async (id, data) => {
    return put(`/api/sys/user/${id}`, data);
};

export const deleteUser = async (id) => {
    return del(`/api/sys/user/${id}`);
};

export const updateUserStatus = async (id, status) => {
    return put(`/api/enterprise/users/${id}/status`, { status });
};
