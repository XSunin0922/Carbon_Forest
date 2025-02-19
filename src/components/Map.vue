<script setup>
import * as Cesium from 'cesium';
import {ref, onMounted, nextTick} from "vue";
import viewSwitch from "./viewSwitch.vue";
import layerSwitch from "./layerSwitch.vue";
import computed from "./computed.vue";
import getCesiumHeat from 'cesiumjs-heat';
import {useResStore} from "../stores/res.js";
import EventBus from "../utils/eventBus.js";

let viewer = ref({});
let tileSet;
let heatMapInstance = ref(null);
const CesiumHeat = getCesiumHeat(Cesium);
const resStore = useResStore();

function viewerSet() {
  viewer.value = new Cesium.Viewer('mapContainer', {
    baseLayerPicker: false,
    timeline: false,
    animation: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    scene3DOnly: true
  });
  viewer.value.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(114, 30, 10000000)
  });
  viewer.value._cesiumWidget._creditContainer.style.display = "none";
}

async function buildingSet() {
  try {
    tileSet = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
    viewer.value.scene.primitives.add(tileSet);
  } catch (error) {
    console.error(error);
  }
}

// 删除热图
function removeHeatMap() {
  if (heatMapInstance.value) {
    heatMapInstance.value.remove();
    heatMapInstance.value = null;
  }
}

// 生成热图
function generateHeatMap() {
  removeHeatMap(); // 先删除上一次的热图
  heatMapInstance.value = new CesiumHeat(
      viewer.value,
      resStore.heatMapPoints,
      [111.356664, 21.461091, 115.421560, 24.392207],
      {
        radius: 10,
        maxOpacity: 0.5,
        minOpacity: 0,
        blur: 0.8
      }
  );
}

// 加载热力图
EventBus.on('edgeEffectMeasured', generateHeatMap);

onMounted( async () => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MDdmYTZmOS05ZDczLTQ5MDYtYWU0MS0xNzFlODRmYjk2MmYiLCJpZCI6MjI5MjQyLCJpYXQiOjE3MjE2MzYzNjd9.g5_le1_diA7_fGKCiYGLzJKgqI9_e3XqVGcPGGow-18';
  viewerSet();
  await nextTick();
  await buildingSet();
})
</script>

<template>
  <div id="mapContainer"></div>
  <layerSwitch :viewer="viewer"></layerSwitch>
  <viewSwitch :viewer="viewer"></viewSwitch>
  <computed></computed>
</template>

<style scoped>
#mapContainer {
  height: 100%;
}
</style>