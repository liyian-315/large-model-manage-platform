import {post, put, get} from './index'

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