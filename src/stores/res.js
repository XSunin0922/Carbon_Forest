import { defineStore } from "pinia";

export const useResStore = defineStore("res", {
    state: () => ({
        heatMapPoints: [],
        defaultTable: {},
        gatherTable: {},
        geoDetector: {},
    }),
    actions: {
        setHeatMapPoints(data) {
            this.heatMapPoints = data;
        },
        setDefaultTable(data) {
            this.defaultTable = data;
        },
        setGatherTable(data) {
            this.gatherTable = data;
        },
        setGeoDetector(data) {
            const sanitizedData = data.replace(/NaN/g, "null");
            this.geoDetector = JSON.parse(sanitizedData);
        }
    },
    getters: {
        getLineList: (state) => (table) => {
            let lineList = [];
            Object.keys(state[table]).forEach((key) => {
               lineList.push(key);
            });
            return lineList;
        },
        getDistanceList: (state) => (table) => {
            let distanceList = [];
            state[table][Object.keys(state[table])[0]].forEach((dvItem) => {
                distanceList.push(dvItem['distance']);
            })
            return distanceList;
        },
        getValuesList: (state) => (table) => {
            let valuesList = [];
            Object.keys(state[table]).forEach((line) => {
                let sonLineList = [];
                state[table][line].forEach((dvItem) => {
                    sonLineList.push(dvItem['value']);
                })
                valuesList.push(sonLineList);
            });
            return valuesList;
        },
        getMatrixColumn: (state) => (key) => {
            if (!state['geoDetector'][key]) return [];
            return Object.keys(state['geoDetector'][key]);
        },
        getMatrixTableData: (state) => (key) => {
            if (!state['geoDetector'][key]) return [];
            return Object.keys(state['geoDetector'][key]).map((column) => {
                return {name: column, ...state['geoDetector'][key][column]}
            });
        },
        getTableData: (state) => (key) => {
            if (!state['geoDetector'][key]) return [];
            let columns = Object.keys(state['geoDetector'][key]);
            let rowNames = Object.keys(state['geoDetector'][key][columns[0]]);
            return rowNames.map((rowName) => {
                let row = {name: rowName};
                columns.forEach((column) => {
                    row[column] = state['geoDetector'][key][column][rowName];
                });
                return row;
            })
        }
    }
})