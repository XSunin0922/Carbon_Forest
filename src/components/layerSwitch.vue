<script setup>
import * as Cesium from 'cesium';
import * as echarts from 'echarts';
import Heatmap from 'heatmap.js';
import {onMounted, ref, watch} from "vue";
import olHeatMap from './olHeatMap.vue';
import option from "../utils/echarts_option.js";

const props = defineProps(['viewer']);
const heatMapContainer = ref(null);
const heatMapCanvas = ref(null);
const echartsTableContainer = ref(null);
const echartsManage = ref(false);
const layerManage = ref(false);
let WMTSLayers = ref([
  {id: 'zsj_lulc_10', obj: null, lay: null, on: false},
  {id: 'zsj_lulc_20', obj: null, lay: null, on: false},
  {id: 'tot_c_cur', obj: null, lay: null, on: false},
  {id: 'tot_c_fut', obj: null, lay: null, on: false},
  {id: 'delta_cur_fut', obj: null, lay: null, on: false},
  {id: 'c_above_cur', obj: null, lay: null, on: false},
  {id: 'c_above_fut', obj: null, lay: null, on: false}
]);
let heatMap = ref({id: 'heatMap', point: null, lay: null, on: false});

function tableInitial() {
  const myChart = echarts.init(echartsTableContainer.value);
  option && myChart.setOption(option);
}

function WMTSlayerSet(layer) {
  if (props.viewer && props.viewer.imageryLayers) {
    // imageryProvider
    layer.obj = new Cesium.WebMapTileServiceImageryProvider({
      url: `/geoserver/gwc/service/wmts/rest/carbon:${layer.id}/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png`,
      layer: `carbon:${layer.id}`,
      style: '',
      format: 'image/png',
      tileMatrixSetID: 'EPSG:4326',
      tileMatrixLabels: ["EPSG:4326:0", "EPSG:4326:1", "EPSG:4326:2", "EPSG:4326:3", "EPSG:4326:4", "EPSG:4326:5", "EPSG:4326:6", "EPSG:4326:7", "EPSG:4326:8", "EPSG:4326:9", "EPSG:4326:10", "EPSG:4326:11", "EPSG:4326:12", "EPSG:4326:13", "EPSG:4326:14", "EPSG:4326:15"],
      tilingScheme: new Cesium.GeographicTilingScheme(),
      rectangle: new Cesium.Rectangle(Cesium.Math.toRadians(111.3), Cesium.Math.toRadians(21.5), Cesium.Math.toRadians(115.5), Cesium.Math.toRadians(24.4))
    });
    // imageryLayer
    layer.lay = props.viewer.imageryLayers.addImageryProvider(layer.obj);
  }
}

function WMTSLayerToggle(layer) {
  if (props.viewer && props.viewer.imageryLayers) {
    if (layer.on) {
      if (layer.obj === null) {
        switch (layer.id) {
          case 'zsj_lulc_10':
            WMTSlayerSet(layer);
            break;
          case 'zsj_lulc_20':
            WMTSlayerSet(layer);
            break;
          case 'tot_c_cur':
            WMTSlayerSet(layer);
            break;
          case 'tot_c_fut':
            WMTSlayerSet(layer);
            break;
          case 'delta_cur_fut':
            WMTSlayerSet(layer);
            break;
          case 'c_above_cur':
            WMTSlayerSet(layer);
            break;
          case 'c_above_fut':
            WMTSlayerSet(layer);
            break;
        }
      }
    } else {
      if (layer.obj !== null) {
        props.viewer.imageryLayers.remove(layer.lay, true);
        layer.obj = null;
      }
    }
  }
}

function getColorForHeight(height) {
  if (height < 6000) {
    return Cesium.Color.fromBytes(227, 233, 215, 100)
  } else if (height < 12000) {
    return Cesium.Color.fromBytes(165, 189, 138, 100)
  } else if (height < 18000) {
    return Cesium.Color.fromBytes(115, 147, 83, 100)
  } else if (height < 24000) {
    return Cesium.Color.fromBytes(61, 79, 47, 100)
  }
}

function heatMapSet(heatMap) {
  if (props.viewer.dataSources && props.viewer.imageryLayers) {
    const time = Cesium.JulianDate.now();
    Cesium.GeoJsonDataSource.load('/geoserver/carbon/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=carbon%3Azsj_above&maxFeatures=50&outputFormat=application%2Fjson', {
      stroke: Cesium.Color.BLACK,
      strokeWidth: 2,
      fill: Cesium.Color.PINK.withAlpha(0.5)
    }).then((dataSource) => {
      // props.viewer.dataSources.add(dataSource);
      heatMap.value.point = dataSource.entities.values;
      heatMap.value.point.forEach((entity) => {
        const entityProperties = entity.properties.getValue(time);
        const height = entityProperties.AGBC__kg_C * 2000;
        props.viewer.entities.add({
          name: entityProperties.Code,
          description: `value: ${entityProperties.AGBC__kg_C / 10} t/hm`,
          position: entity.position.getValue(time),
          cylinder: {
            length: height,
            topRadius: 1000,
            bottomRadius: 1000,
            material: getColorForHeight(height),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            slices: 6,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 400000)
          }
        });
      });
      return heatMap.value.point.map(entity => {
        const position = entity.position.getValue(time);
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const value = entity.properties.AGBC__kg_C.getValue();
        return {
          x: lon,
          y: lat,
          value: value
        };
      });
    }).catch((error)=>{
      console.error(error);
    }).then((point) => {
      const heatmapInstance = Heatmap.create({
        container: heatMapContainer.value,
        radius: 20,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        blur: 0.85
      });
      heatmapInstance.setData({
        data: point,
        max: 13
      });
      heatmapInstance._renderer.canvas = heatMapCanvas.value;
      heatmapInstance.repaint();
      const dataUrl = heatMapCanvas.value.toDataURL('image/png');
      const heatmapTexture = new Cesium.SingleTileImageryProvider({
        url: dataUrl,
        tileHeight: 100,
        tileWidth: 100
      });
      heatMap.value.lay = props.viewer.imageryLayers.addImageryProvider(heatmapTexture);
    }).catch(error => {
      console.error(error);
      heatMap.value.on = false;
    })
  }
}

function updateHeatmapLayer() {
  const heatmapImage = localStorage.getItem('heatmapImage');
  if (heatmapImage) {
    if (heatMap.value.lay) {
      props.viewer.imageryLayers.remove(heatMap.value.lay);
    }
    heatMap.value.lay = props.viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      url: heatmapImage,
      rectangle: new Cesium.Rectangle(Cesium.Math.toRadians(111.3), Cesium.Math.toRadians(21.5), Cesium.Math.toRadians(115.5), Cesium.Math.toRadians(24.4))
    }));
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === "heatmapImage") {
    updateHeatmapLayer();
  }
});

watch(WMTSLayers, (newLayers) => {
  newLayers.forEach(layer => {
    WMTSLayerToggle(layer);
  });
}, {deep: true, flush: 'post'});

watch(() => heatMap.value.on, () => {
  if (heatMap.value.on) {
    if (!heatMap.value.point && !heatMap.value.lay) {
      heatMapSet(heatMap);
      updateHeatmapLayer();
    }
  } else {
    if (heatMap.value.point && heatMap.value.lay) {
      props.viewer.entities.removeAll();
      props.viewer.imageryLayers.remove(heatMap.value.lay, true);
      heatMap.value.point = null;
      heatMap.value.lay = null;
    }
  }
}, {flush: 'post'});

watch(echartsManage, () => {
  tableInitial();
})

</script>

<template>
  <button class="btn" id="layerManage" @click="layerManage=!layerManage">layerManage</button>
  <div id="layerControl" v-show="layerManage">
    <h3>Layer Control</h3>
    <div class="layerItem" v-for="layer in WMTSLayers" :key="layer.id">
      <label :for="layer.id" class="checkText">{{ layer.id }}</label>
      <input type="checkbox" class="checkBox" @click="layer.on=!layer.on"/>
    </div>
    <div class="layerItem">
      <label :for="heatMap.id" class="checkText">{{ heatMap.id }}</label>
      <input type="checkbox" class="checkBox" @click="heatMap.on=!heatMap.on"/>
    </div>
  </div>
  <button class="btn" id="tableControl" @click="echartsManage=!echartsManage">Carbon Pool</button>
  <div id="echartsTable" ref="echartsTableContainer" v-show="echartsManage"></div>
  <div class="heatMap" ref="heatMapContainer">
    <canvas class="heatMap" ref="heatMapCanvas" style="width: 100%; height: 100%"></canvas>
  </div>
  <olHeatMap></olHeatMap>
</template>

<style scoped>
#echartsTable {
  position: absolute;
  border: none;
  border-radius: 20px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.6);
  width: 600px;
  height: 400px;
  right: 10px;
  top: 50px;
}

.heatMap {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>