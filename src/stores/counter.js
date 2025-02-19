import { defineStore } from 'pinia';
import { getComputedLayers, getOriginLayers, getGeoServerLayers } from '../utils/model.js'

export const useLayersStore = defineStore('counter', {
    state: () => ({
        // 发布地图写死
        publishedLayers: [
            {id: 'zsj_lulc_10', describe: '10年土地利用'},
            {id: 'zsj_lulc_20', describe: '20年土地利用'},
            {id: 'tot_c_cur', describe: '20年总碳库'},
            {id: 'tot_c_fut', describe: '30年总碳库（预测）'},
            {id: 'delta_cur_fut', describe: '20-30年间碳库变化'},
            {id: 'c_above_cur', describe: '20年地上碳库'},
            {id: 'c_above_fut', describe: '30年地上碳库（预测）'},
        ],
        publishedComputedLayers: [],
        originLayers: [],
        computedLayers: []
    }),
    actions: {
        async getLayers() {
            let res_o = await getOriginLayers();
            let res_c = await getComputedLayers();
            this.originLayers = res_o.data;
            this.computedLayers = res_c.data;
        },
        async getGeoServerLayers() {
            let res_c = await getGeoServerLayers('computed');
            this.publishedComputedLayers = res_c.data;
        }
    },
    getters: {
        getPublishedLayers(state) {
            let reLayers = [];
            state.publishedLayers.forEach((layer) => {
                let lay = {}
                lay.id = layer.id
                lay.describe = layer.describe
                lay.obj = null
                lay.lay = null
                lay.on = false
                reLayers.push(lay)
            });
            return reLayers;
        },
        getPublishedComputedLayers(state) {
            let reLayers = [];
            state.publishedComputedLayers.forEach((layer) => {
                let lay = {}
                lay.id = layer
                lay.obj = null
                lay.lay = null
                lay.on = false
                reLayers.push(lay)
            });
            return reLayers;
        },
        getComputedLayersList(state) {
            return state.computedLayers
        },
        getOriginLayersList(state) {
            return state.originLayers
        }
    },
})