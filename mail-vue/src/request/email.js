import http from '@/axios/index.js';

export function emailList(accountId, allReceive, emailId, timeSort, size, type) {
    return http.get('/email/list', {params: {accountId, allReceive, emailId, timeSort, size, type}})
}

export function emailDelete(emailIds) {
    return http.delete('/email/delete?emailIds=' + emailIds)
}

export function emailLatest(emailId, accountId, allReceive) {
    return http.get('/email/latest', {params: {emailId, accountId, allReceive}, noMsg: true, timeout: 35 * 1000})
}

export function emailRead(emailIds, unread = 1) {
    return http.put('/email/read', {emailIds, unread})
}

export function emailSend(form,progress) {
    return http.post('/email/send', form,{
        onUploadProgress: (e) => {
            progress(e)
        },
        noMsg: true
    })
}

export function emailTrashList(accountId, allReceive, emailId, timeSort, size) {
    return http.get('/email/trash', {params: {accountId, allReceive, emailId, timeSort, size}})
}

export function emailRestore(emailIds) {
    return http.put('/email/restore', {emailIds})
}

export function emailPhysicsDelete(emailIds) {
    return http.delete('/email/physicsDelete?emailIds=' + emailIds)
}

export function scheduleCreate(form) {
    return http.post('/schedule/create', form)
}

export function scheduleList(scheduleId, timeSort, size) {
    return http.get('/schedule/list', {params: {scheduleId, timeSort, size}})
}

export function scheduleCancel(scheduleIds) {
    return http.delete('/schedule/cancel?scheduleIds=' + scheduleIds)
}