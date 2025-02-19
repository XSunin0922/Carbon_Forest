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

export const getOriginLayers = async () => {
    return await service.get("/get_origin_layer_list");
}

export const getComputedLayers = async () => {
    return await service.get("/get_computed_layer_list");
}

export const downloadReTable = async (table_name) => {
    return await service.get("/download_output_table", { responseType: 'blob', params: { table_name: table_name } });
}

export const geoDetector = async (data) => {
    return await service.post("/geodetector", data);
}

export const getGeoServerLayers = async (workspace) => {
    return await service.get("/get_geoserver_layers_list", { params: { workspace: workspace } });
}
