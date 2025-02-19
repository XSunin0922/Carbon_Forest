import axios from 'axios';

const pendingRequest = new Map();

const service = axios.create({
    baseURL: 'http://127.0.0.1:4001',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getRequestKey = (config) => {
    return [config.method, config.url].join(':');
};

service.interceptors.request.use(
    (config) => {
        const requestKey = getRequestKey(config);
        if (pendingRequest.has(requestKey)) {
            const cancelToken = pendingRequest.get(requestKey);
            cancelToken.cancel('Cancel duplicate request');
            pendingRequest.delete(requestKey);
        }
        const cancelToken = axios.CancelToken.source();
        config.cancelToken = cancelToken.token;
        pendingRequest.set(requestKey, cancelToken);
        return config;
    },
    (error) =>{
        return Promise.reject(error)
    }
);

service.interceptors.response.use(
    (response) => {
        const requestKey = getRequestKey(response.config);
        pendingRequest.delete(requestKey);
        return response;
    },
    (error) => {
        const requestKey = getRequestKey(error.config || {});
        pendingRequest.delete(requestKey);
        return Promise.reject(error);
    }
);

export default service;