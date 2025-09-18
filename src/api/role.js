import {post, put, get, del} from './index'

// 角色相关API

export function addRole(params) {
    return post('/api/sys/role/add',params)
}

export function updateRole(params) {
    return put('/api/sys/role/update',params)
}

export function deleteRole(params) {
    return del(`/api/sys/role/delete/${params}`)
}

export function getRoleById (params) {
    return get(`/api/sys/role/get/${params}`);
};



export function getAllRoles() {
    return get('/api/sys/role/all');
}

export function getRolePage (params)  {
    return get('/api/sys/role/page', params);
}
