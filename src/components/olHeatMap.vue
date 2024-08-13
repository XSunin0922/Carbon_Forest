<script setup>
import {ref, onMounted, watch} from "vue";
import {Map, View} from 'ol';
import {StadiaMaps as StadiaMapsSource, Vector as VectorSource} from "ol/source";
import {Heatmap as HeatmapLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {GeoJSON} from "ol/format";

const blur = ref(100);
const radius = ref(50);
const mapContainer = ref(null);

const point = new VectorSource({
  url: '/geoserver/carbon/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=carbon%3Azsj_above&maxFeatures=50&outputFormat=application%2Fjson',
  format: new GeoJSON()
});
const vectorLayer = new VectorLayer({
  source: point
});

const heatmapLayer = new HeatmapLayer({
  source: point,
  blur: blur.value,
  radius: radius.value,
  weight: function (fea) {
    return fea.get('AGBC__kg_C');
  }
});

const mapLayer = new TileLayer({
  source: new StadiaMapsSource({
    layer: 'stamen_toner'
  })
})

function olMapInitial() {
  new Map({
    target: 'olMap',
    layers: [mapLayer, heatmapLayer, vectorLayer],
    view: new View({
      center: [113, 23],
      zoom: 9,
      projection: 'EPSG:4326'
    }),
  });
}

watch([blur, radius], (newValue) => {
  console.log(newValue);
  heatmapLayer.setBlur(parseInt(newValue[0], 10));
  heatmapLayer.setRadius(parseInt(newValue[1], 10));
})

onMounted(() => {
  olMapInitial();
})
</script>

<template>
  <div id="olMap" ref="mapContainer">
    <div id="BlurRadiusCtrl">
      <label>Blur: <input type="range" min="50" max="150" v-model="blur"></label>
      <label>Radius: <input type="range" min="30" max="60" v-model="radius"></label>
    </div>
  </div>
</template>

<style scoped>
#olMap {
  position: relative;
  width: 100%;
  height: 898px;
  padding: 0;
  margin: 0;
}
#BlurRadiusCtrl {
  position: absolute;
  z-index: 1;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255,255,255,0.8);
}
</style>