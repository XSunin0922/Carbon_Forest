<script setup>
import * as Cesium from 'cesium';

const props = defineProps(['viewer']);
let zsj_extent;
let csj_extent;

function flyToZSJ() {
  props.viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(113, 23, 600000),
    duration: 2
  });
}

function flyToCSJ() {
  props.viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(117, 31, 600000),
    duration: 2
  });
}

function extentSet(city) {
  if (props.viewer.dataSources) {
    Cesium.GeoJsonDataSource.load(`/geoserver/carbon/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=carbon%3A${city}_extent&maxFeatures=50&outputFormat=application%2Fjson`, {
      stroke: Cesium.Color.BLACK,
      fill: Cesium.Color.SEASHELL.withAlpha(0),
    }).then(dataSource => {
      zsj_extent = dataSource;
      props.viewer.dataSources.add(dataSource);
    }).catch(error => console.error(error))
  }
}

function handleFly(cityName) {
  if (cityName === 'zsj') {
    flyToZSJ();
    if (!zsj_extent) {
      extentSet(cityName);
    }
  } else if (cityName === 'csj') {
    flyToCSJ();
    if (!csj_extent) {
      extentSet(cityName);
    }
  }
}
</script>

<template>
  <div class="ctrlBar" id="flyTo">
    <button class="btn" id="flyToZSJ" @click="handleFly('zsj')">flyToZSJ</button>
    <button class="btn" id="flyToCSJ" @click="flyToCSJ">flyToCSJ</button>
  </div>
</template>

<style scoped>
#flyToCSJ {
  left: 140px;
  bottom: 0;
}

#flyToZSJ {
  left: 10px;
  bottom: 0;
}
</style>