import {getCurrentInstance} from 'vue'
export function useRequest(){
    const {props} = getCurrentInstance()
    const request = props.Request
    const GetTask = (params = {}) => {
        return new Promise((resolve, reject) => {
            request
            .post('/new/task/download/offers/v11', params)
            .then((res) => {
                return resolve(res)
            })
            .catch((e) => {
                return reject(e)
            })
        })
    }
    const GetTaskStatus = (params = {}) => {
        return new Promise((resolve, reject) => {
            request
            .post('/new/task/download/task/status', params)
            .then((res) => {
                return resolve(res)
            })
            .catch((e) => {
                return reject(e)
            })
        })
    }
    const GetTaskRewards = (params = {}) => {
        return new Promise((resolve, reject) => {
            request
            .post('/new/task/download/increase/v4', params)
            .then((res) => {
                return resolve(res)
            })
            .catch((e) => {
                return reject(e)
            })
        })
    }
    return {
        GetTask,
        GetTaskStatus,
        GetTaskRewards
    }
} 