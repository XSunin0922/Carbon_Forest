<script setup>
import * as Cesium from 'cesium';
import * as echarts from 'echarts';
import {onMounted, ref, watch} from "vue";
import option from "../utils/echarts_option.js";
import {SortDown, SortUp} from "@element-plus/icons-vue";
import {ElLoading} from "element-plus";
import EventBus from "../utils/eventBus.js";
import {useLayersStore} from "../stores/counter.js";

const layersStore = useLayersStore();
const { } = layersStore;
const props = defineProps(['viewer']);
const echartsTableContainer = ref(null);
const legend_src = ref('');
const echartsManage = ref(false);
const layerManage = ref(false);
const activeTab = ref('1');
let WMTSLayers = ref();
let computedLayers = ref();
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
    layer.lay.alpha = 0.6;
    legend_src.value = `/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=carbon%3A${layer.id}`;
  }
}

function layerUpDown(type, lay) {
  if (props.viewer && props.viewer.imageryLayers && lay) {
    if (type === 'Up') {
      props.viewer.imageryLayers.raise(lay);
    } else if (type === 'Down') {
      props.viewer.imageryLayers.lower(lay);
    }
  }
}

function WMTSLayerToggle(layer) {
  if (props.viewer && props.viewer.imageryLayers) {
    if (layer.on) {
      if (layer.obj === null) {
        WMTSlayerSet(layer);
      }
    } else {
      if (layer.obj !== null) {
        props.viewer.imageryLayers.remove(layer.lay, true);
        // debug
        layer.lay = null;
        layer.obj = null;
        legend_src.value = '';
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

const getLayerList = () => {
  return WMTSLayers.value.map(layer => {return layer.id});
}

EventBus.on('getLayerLists', getLayerList)

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
  WMTSLayers.value = layersStore.getOriginLayers;
})

</script>

<template>
  <button class="btn" id="layerManage" @click="layerManage=!layerManage">layerManage</button>
  <div id="layerControl" v-show="layerManage">
    <h3>Layer Control</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="OriginLayers" name="1">
        <div class="layerItem" v-for="layer in WMTSLayers" :key="layer.id">
          <el-icon size="20" @click="layerUpDown('Down', layer.lay)">
            <SortDown/>
          </el-icon>
          <el-icon size="20" @click="layerUpDown('Up', layer.lay)">
            <SortUp/>
          </el-icon>
          <input type="checkbox" class="checkBox" @click="handleLayerClick(layer)"/>
          <el-tooltip placement="right-start" :content="layer.describe" effect="light">
            <label :for="layer.id" class="checkText">{{ layer.id }}</label>
          </el-tooltip>
        </div>
        <div class="layerItem" id="heatmap">
          <label :for="heatMap.id" class="checkText">{{ heatMap.id }}</label>
          <input type="checkbox" class="checkBox" @click="heatMap.on=!heatMap.on"/>
        </div>
      </el-tab-pane>
      <el-tab-pane label="ComputedLayers" name="2">
        <div class="layerItem" v-for="layer in computedLayers" :key="layer.id"></div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <button class="btn" id="tableControl" @click="echartsManage=!echartsManage">Carbon Pool</button>
  <div id="echartsTable" ref="echartsTableContainer" v-show="echartsManage"></div>
  <el-image v-if="legend_src" id="legend" :src="legend_src" fit="fill"></el-image>
</template>

<style scoped>
#tableControl {
  top: 5px;
  right: 50px;
}

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
  top: 5px;
  left: 10px;
}

.layerItem {
  display: flex;
  align-items: center;
  height: 40px;

  .checkBox:hover {
    opacity: 0.7;
  }

  .checkText {
    position: relative;
    left: 20px;
    font-size: 20px;
  }
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
  bottom: 70px;
  height: 200px;
  width: 100px;
}

#layerControl {
  user-select: none;
  overflow: auto;
  position: absolute;
  padding: 20px;
  z-index: 1;
  color: #1c0249;
  background: linear-gradient(45deg, #1cd6ce, #002f5f);
  background-size: 400% 400%;
  border-radius: 10px;
  width: 300px;
  height: 400px;
  left: 10px;
  top: 50px;
  font-size: 25px;
  font-family: "Microsoft YaHei";
  animation: glowing 4s linear infinite;
  opacity: 0.9;
}

#layerControl::-webkit-scrollbar {
  width: 12px;
}

#layerControl::-webkit-scrollbar-track {
  background: #1cd6ce; /* Background of the scrollbar track */
  border-radius: 10px;
}

#layerControl::-webkit-scrollbar-thumb {
  background: #002f5f; /* Color of the scrollbar thumb */
  border-radius: 10px;
}

#layerControl::-webkit-scrollbar-thumb:hover {
  background: #1c0249; /* Color of the scrollbar thumb on hover */
}

@keyframes glowing {
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
