import service from "./axios.js";

export const publish = async (data) => {
    return await service.post("/publish", data);
}

export const simplify = async (data) => {
    return await service.post("/simplify", data);
}

export const neighborRecognition = async (data) => {
    return await service.post("/neighbor_recognition", data);
}

export const edgeEffectMeasure = async (data) => {
    return await service.post("/edge_effect_measure", data);
}

export const getComputedLayers = async () => {
    return await service.get("/computed_layers");
}
