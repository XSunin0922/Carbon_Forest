<script setup>
import * as Cesium from 'cesium';

const props = defineProps(['viewer']);

function flyToZSJ() {
  props.viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(113, 23, 1000000),
    duration: 2
  });
}
function flyToCSJ() {
  props.viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(117, 31, 1000000),
    duration: 2
  });
}
</script>

<template>
<div class="ctrlBar" id="flyTo">
  <button class="btn" id="flyToZSJ" @click="flyToZSJ">flyToZSJ</button>
  <button class="btn" id="flyToCSJ" @click="flyToCSJ">flyToCSJ</button>
</div>
</template>

<style scoped>

</style>