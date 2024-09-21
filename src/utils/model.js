import service from "./axios.js";

const get = (url, params) => service.get(url, { params });
const post = (url, data) => service.post(url, data);
const put = (url, data) => service.put(url, data);
const del = (url) => service.delete(url);

const checkParams = (params) => {

}

export const publishLayer = params => {

}