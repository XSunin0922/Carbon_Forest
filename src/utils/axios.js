import axios from 'axios';

let pendingRequest = [];

const service = axios.create({
    baseURL: 'http://0.0.0.0:4001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

service.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

function cancelRepeatRequest(config) {
    for (let i = 0; i < pendingRequest.length; i++) {
        if (pendingRequest[i].url === config.url) {
            pendingRequest[i].cancel();
            pendingRequest.splice(i, 1);
        }
    }
}

function removePendingRequest(config) {
    for (let i = 0; i < pendingRequest.length; i++) {
        if (pendingRequest[i].url === config.url) {
            pendingRequest.splice(i, 1);
        }
    }
}

export default service;