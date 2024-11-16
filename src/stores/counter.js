import { defineStore } from 'pinia';
import * as Model from '../utils/model.js'

export const useLayersStore = defineStore('counter', {
    state: () => ({
        originLayers: [
            {id: 'zsj_lulc_10', describe: '10年土地利用'},
            {id: 'zsj_lulc_20', describe: '20年土地利用'},
            {id: 'tot_c_cur', describe: '20年总碳库'},
            {id: 'tot_c_fut', describe: '30年总碳库（预测）'},
            {id: 'delta_cur_fut', describe: '20-30年间碳库变化'},
            {id: 'c_above_cur', describe: '20年地上碳库'},
            {id: 'c_above_fut', describe: '30年地上碳库（预测）'},
        ],
        computedLayers: []
    }),
    actions: {
        async getComputedLayers() {

        }
    },
    getters: {
        getOriginLayers(state) {
            let reLayers = [];
            state.originLayers.forEach((layer) => {
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
        getOriginLayersList(state) {
            return state.originLayers.map(layer => {
                return layer.id;
            });
        },
        getComputedLayersList(state) {
            // debug
            if (state.computedLayers) {
                return state.computedLayers
            }
        }
    },
})