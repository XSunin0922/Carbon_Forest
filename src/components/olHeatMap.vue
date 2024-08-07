<script setup>
import {ref, onMounted, watch} from "vue";
import {Map, View} from 'ol';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import HeatmapLayer from 'ol/layer/Heatmap';
import {GeoJSON} from "ol/format";
import {toPng} from 'html-to-image'

const blur = ref(100);
const radius = ref(20);
const mapContainer = ref(null);
let map;
let heatmapLayer;

const point = new VectorSource({
  url: '/geoserver/carbon/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=carbon%3Azsj_above&maxFeatures=50&outputFormat=application%2Fjson',
  format: new GeoJSON()
});
const vectorLayer = new VectorLayer({
  source: point
});

function createHeatmapLayer(blur, radius) {
  return new HeatmapLayer({
    source: point,
    blur: blur,
    radius: radius,
    weight: function (fea) {
      return fea.get('AGBC__kg_C');
    }
  });
}

function olMapInitial() {
  heatmapLayer = createHeatmapLayer(blur.value, radius.value);
  map = new Map({
    target: 'olMap',
    layers: [heatmapLayer, vectorLayer],
    view: new View({
      center: [113, 23],
      zoom: 8,
      projection: 'EPSG:3857'
    }),
  });
  map.once('rendercomplete', () => {
    toPng(mapContainer.value).then((dataUrl) => {
      localStorage.setItem('heatmapImage', dataUrl.toString());
      window.dispatchEvent(new Event('storage'));
    });
  })
}

watch([blur, radius], ([newBlur, newRadius]) => {
  map.removeLayer(heatmapLayer);
  createHeatmapLayer(newBlur, newRadius);
  map.addLayer(heatmapLayer);
  map.once('rendercomplete', () => {
    toPng(mapContainer.value).then((dataUrl) => {
      localStorage.setItem('heatmapImage', dataUrl.toString());
      window.dispatchEvent(new Event('storage'));
    });
  })
})

onMounted(() => {
  olMapInitial();
})
</script>

<template>
  <div id="olMap" ref="mapContainer"></div>
  <div>
    <label>Blur: <input type="range" min="0" max="500" v-model="blur"></label>
    <label>Radius: <input type="range" min="0" max="500" v-model="radius"></label>
  </div>
</template>

<style scoped>

</style>