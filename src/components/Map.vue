<script setup>
import * as Cesium from 'cesium';
import {ref, onMounted} from "vue";
import viewSwitch from "./viewSwitch.vue";
import layerSwitch from "./layerSwitch.vue";

let viewer = ref({});
let tileSet;

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
    destination: Cesium.Cartesian3.fromDegrees(114, 30, 10000000),
  });
}

async function buildingSet() {
  try {
    tileSet = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
    viewer.value.scene.primitives.add(tileSet);
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MDdmYTZmOS05ZDczLTQ5MDYtYWU0MS0xNzFlODRmYjk2MmYiLCJpZCI6MjI5MjQyLCJpYXQiOjE3MjE2MzYzNjd9.g5_le1_diA7_fGKCiYGLzJKgqI9_e3XqVGcPGGow-18';
  viewerSet();
  buildingSet();
})
</script>

<template>
  <div id="mapContainer">
    <layerSwitch :viewer="viewer"></layerSwitch>
  </div>
  <viewSwitch :viewer="viewer"></viewSwitch>
</template>

<style scoped>
#mapContainer {
  position: relative;
  padding: 0;
  margin: 0;
}
</style>