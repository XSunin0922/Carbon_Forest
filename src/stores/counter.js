import { defineStore } from 'pinia';

export const useLayersStore = defineStore('counter', {
    state: () => ({
        layers: [
            {id: 'zsj_lulc_10', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '10年土地利用'},
            {id: 'zsj_lulc_20', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年土地利用'},
            {id: 'tot_c_cur', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年总碳库'},
            {id: 'tot_c_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '30年总碳库（预测）'},
            {id: 'delta_cur_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20-30年间碳库变化'},
            {id: 'c_above_cur', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年地上碳库'},
            {id: 'c_above_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '30年地上碳库（预测）'},
        ],
    }),
    actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
    },
    getters: {
    },
})