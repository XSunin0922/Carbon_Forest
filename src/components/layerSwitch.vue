<script setup>
import * as Cesium from 'cesium';
import * as echarts from 'echarts';
import {onMounted, ref, watch} from "vue";
import option from "../utils/echarts_option.js";
import {SortDown, SortUp} from "@element-plus/icons-vue";
import {ElLoading} from "element-plus";

const props = defineProps(['viewer']);
const echartsTableContainer = ref(null);
const src = ref('');
const echartsManage = ref(false);
const layerManage = ref(false);
let WMTSLayers = ref([
  {id: 'zsj_lulc_10', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '10年土地利用'},
  {id: 'zsj_lulc_20', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年土地利用'},
  {id: 'tot_c_cur', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年总碳库'},
  {id: 'tot_c_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '30年总碳库（预测）'},
  {id: 'delta_cur_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20-30年间碳库变化'},
  {id: 'c_above_cur', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '20年地上碳库'},
  {id: 'c_above_fut', obj: null, lay: null, on: false, alpha: 0.6, fcUp: null, fcDown: null, content: '30年地上碳库（预测）'},
]);
let heatMap = ref({id: 'heatPoint', point: null, on: false});

async function tableInitial() {
  const myChart = echarts.init(echartsTableContainer.value);
  option && myChart.setOption(option);
}

function WMTSlayerSet(layer) {
  if (props.viewer && props.viewer.imageryLayers) {
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
    layer.lay = props.viewer.imageryLayers.addImageryProvider(layer.obj);
    layer.lay.alpha = layer.alpha;
    layer.fcUp = function () {
      return UpDown('Up', layer.lay);
    };
    layer.fcDown = function () {
      return UpDown('Down', layer.lay);
    };
    src.value = `/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=carbon%3A${layer.id}`;
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
        // debug
        layer.lay = null;
        layer.obj = null;
        src.value = '';
      }
    }
  }
}

function UpDown(type, lay) {
  if (props.viewer && props.viewer.imageryLayers && lay) {
    if (type === 'Up') {
      props.viewer.imageryLayers.raise(lay);
    } else if (type === 'Down') {
      props.viewer.imageryLayers.lower(lay);
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
  if (props.viewer.dataSources) {
    const time = Cesium.JulianDate.now();
    Cesium.GeoJsonDataSource.load('/geoserver/carbon/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=carbon%3Azsj_above&maxFeatures=50&outputFormat=application%2Fjson', {
      // stroke: Cesium.Color.BLACK,
      // strokeWidth: 2,
      // fill: Cesium.Color.PINK.withAlpha(0.5)
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
    }).catch((error) => {
      console.error(error);
    })
  }
}

function handleLayerClick(layer) {
  layer.on = !layer.on;
  if (layer.on) {
    const loading = ElLoading.service({
      text: 'Map Loading...',
      background: 'rgba(0, 0, 0, 0.4)'
    });
    setTimeout(() => {
      loading.close();
    }, 1000)
  }
}

watch(WMTSLayers, (newLayers) => {
  newLayers.forEach(layer => {
    WMTSLayerToggle(layer);
  });
}, {deep: true, flush: 'post'});

watch(() => heatMap.value.on, () => {
  if (heatMap.value.on) {
    if (!heatMap.value.point) {
      heatMapSet(heatMap);
    }
  } else {
    if (heatMap.value.point) {
      props.viewer.entities.removeAll();
      heatMap.value.point = null;
    }
  }
}, {flush: 'post'});

onMounted(() => {
  tableInitial();
})

</script>

<template>
  <button class="btn" id="layerManage" @click="layerManage=!layerManage">layerManage</button>
  <div id="layerControl" v-show="layerManage">
    <h3>Layer Control</h3>
    <div class="layerItem" v-for="layer in WMTSLayers" :key="layer.id">
      <el-icon size="20" @click="layer.fcDown">
        <SortDown/>
      </el-icon>
      <el-icon size="20" @click="layer.fcUp">
        <SortUp/>
      </el-icon>
      <input type="checkbox" class="checkBox" @click="handleLayerClick(layer)"/>
      <el-tooltip placement="right-start" :content="layer.content">
        <label :for="layer.id" class="checkText">{{ layer.id }}</label>
      </el-tooltip>
    </div>
    <div class="layerItem" id="heatmap">
      <label :for="heatMap.id" class="checkText">{{ heatMap.id }}</label>
      <input type="checkbox" class="checkBox" @click="heatMap.on=!heatMap.on"/>
    </div>
  </div>
  <button class="btn" id="tableControl" @click="echartsManage=!echartsManage">Carbon Pool</button>
  <div id="echartsTable" ref="echartsTableContainer" v-show="echartsManage"></div>
  <el-image v-if="src" id="legend" :src fit="fill"></el-image>
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

#layerManage {
  left: 10px;
}

.layerItem {
  display: flex;
  align-items: center;
  height: 40px;
}

.layerItem el-icon {
  position: absolute;
}

.checkText {
  position: relative;
  left: 25px;
  font-size: 20px;
}

.checkBox {
  position: absolute;
  left: 60px;
}

.checkBox:hover {
  opacity: 0.7;
}

#heatmap label {
  left: 66px;
}

h3 {
  margin: 10px;
}

#legend {
  z-index: 1;
  position: absolute;
  right: 30px;
  bottom: 30px;
  height: 200px;
  width: 100px;
}
</style>