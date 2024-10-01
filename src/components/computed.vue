<script setup>
import {ref} from 'vue'
import * as Model from '../utils/model.js'
import EventBus from "../utils/eventBus.js";
import {useLayersStore} from "../stores/counter.js";

const {publish, simplify, neighborRecognition, edgeEffectMeasure} = Model
const layersStore = useLayersStore();
const {getOriginLayersList, getComputedLayersList, getComputedLayers} = layersStore;
const computedModel = ref([
  {name: 'InVESTCarbonModel'},
  {name: 'simplifyRaster'},
  {name: 'neighborRecognition'},
  {name: 'edgeEffectMeasure'},
  {name: 'geoDetector'},
]);
const formOn = ref(false);
const dialogOn = ref(false);
const computedOption = ref({
  input_raster: '',
  output_raster: '',
  output_table: '',
  resample_cell_size: '',
  filter_cell_size: '',
  forest_index: '',
  distance_class: '',
  edge_distance: '',
  simplify_raster: '',
  carbon_raster: '',
  neighbor_extent: '',
});
const currentModel = ref('');

const toggleParamsSetForm = async (model_name) => {
  formOn.value = !formOn.value;
  if (model_name !== currentModel.value) {
    formOn.value = true;
    Object.keys(computedOption.value).forEach(param => {
      computedOption.value[param] = '';
    });
    currentModel.value = model_name;
    await getComputedLayers();
  }
}

function geoserverParamsSet(data) {
  geoserverParams.data_path = data
  geoserverParams.store_name = data.split('.')[0]
  geoserverParams.layer_name = data.split('.')[0]
  geoserverParams.workspace = 'carbon';
  geoserverParams.srs = 'EPSG:4326';
  if (data.split('.')[1] === 'tif') {
    geoserverParams.data_type = 'GeoTIFF';
  } else if (data.split('.')[1] === 'shp') {
    geoserverParams.data_type = 'Shapefile';
  }
}

let params;
let geoserverParams;
const handleSubmit = () => {
  params = {};
  geoserverParams = {};
  switch (currentModel.value) {
    case 'InVESTCarbonModel':
      break;
    case 'simplifyRaster':
      params.input_raster = computedOption.value.input_raster + '.tif';
      params.output_raster = computedOption.value.output_raster;
      params.resample_cell_size = Number(computedOption.value.resample_cell_size);
      params.filter_cell_size = Number(computedOption.value.filter_cell_size);
      if (params.output_raster.split('.')[1] !== 'tif') {
        alert('output_raster must be a tif file');
        return;
      }
      geoserverParamsSet(params.output_raster);
      geoserverParams.style = 'lulc_image';
      break;
    case 'neighborRecognition':

      break;
    case 'edgeEffectMeasure':

      break;
    case 'geoDetector':
      break;
  }
  dialogOn.value = true;
}

const handleCompute = async () => {
  switch (currentModel.value) {
    case 'InVESTCarbonModel':
      break;
    case 'simplifyRaster':
      await simplify(params).then(res => {
        console.log(res);
      });
      // await publish(geoserverParams);
      break;
    case 'neighborRecognition':
      await neighborRecognition(params);
      await publish(geoserverParams);
      break;
    case 'edgeEffectMeasure':
      await edgeEffectMeasure(params);
      await publish(geoserverParams);
      break;
    case 'geoDetector':
      break;
  }
}
</script>

<template>
  <el-dropdown id="computed_btn" trigger="click" :hide-on-click="false" placement="top-start">
    <button class="btn">computed</button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(model, index) in computedModel" @click="toggleParamsSetForm(model.name)">
          {{ index }} {{ model.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-form v-if="formOn" v-model="computedOption" label-width="auto" style="max-width: 400px" class="params_set_form">
    <h3>{{ currentModel }}</h3>

    <template v-if="currentModel === 'InVESTCarbonModel'">
      <el-form-item label="input_raster" style="padding-top: 20px">
        <el-select v-model="computedOption.input_raster" placeholder="Select raster">
          <el-option v-for="layerId in getOriginLayersList" :label="layerId" :value="layerId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="output_raster">
        <el-input v-model="computedOption.output_raster"></el-input>
      </el-form-item>
      <el-form-item label="resample_cell_size">
        <el-input v-model="computedOption.resample_cell_size" type="number"></el-input>
      </el-form-item>
      <el-form-item label="filter_cell_size" style="padding-bottom: 20px">
        <el-input v-model="computedOption.filter_cell_size" type="number"></el-input>
      </el-form-item>
      <div style="display: inline-flex; justify-content: center; width: 100%; padding-bottom: 20px">
        <el-button type="info" style="width: 80px;" color="#11659a">Cancel</el-button>
        <el-button type="info" @click="" style="width: 80px" color="#003d74">Compute</el-button>
      </div>
    </template>

    <template v-if="currentModel === 'simplifyRaster'">
      <el-form-item label="input_raster" style="padding-top: 20px">
        <el-select v-model="computedOption.input_raster" placeholder="Select Raster">
          <el-option v-for="layerId in getOriginLayersList" :label="layerId" :value="layerId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="output_raster">
        <el-input v-model="computedOption.output_raster"></el-input>
      </el-form-item>
      <el-tooltip placement="right" effect="light">
        <template #content>Resample cell size<br />Recommended value: 2000</template>
        <el-form-item label="resample_cell_size">
          <el-input v-model="computedOption.resample_cell_size" type="number"></el-input>
        </el-form-item>
      </el-tooltip>
      <el-tooltip placement="right" effect="light">
        <template #content>Convolution kernel<br />Recommended value: 11</template>
        <el-form-item label="filter_cell_size" style="padding-bottom: 20px">
          <el-input v-model="computedOption.filter_cell_size" type="number"></el-input>
        </el-form-item>
      </el-tooltip>
      <div style="display: inline-flex; justify-content: center; width: 100%; padding-bottom: 20px">
        <el-button type="info" @click="toggleParamsSetForm(currentModel)" style="width: 80px;" color="#11659a">Cancel
        </el-button>
        <el-button type="info" @click="handleSubmit" style="width: 80px" color="#003d74">Submit</el-button>
      </div>
    </template>

    <template v-if="currentModel === 'neighborRecognition'">
      <el-form-item label="simplify_raster" style="padding-top: 20px">
        <el-select v-model="computedOption.simplify_raster" placeholder="Select Raster">
          <el-option v-for="layerId in getComputedLayersList" :label="layerId" :value="layerId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="output_raster">
        <el-input v-model="computedOption.output_raster"></el-input>
      </el-form-item>
      <el-form-item label="forest_index">
        <el-input v-model="computedOption.forest_index" type="number"></el-input>
      </el-form-item>
      <div style="display: inline-flex; justify-content: center; width: 100%; padding-bottom: 20px">
        <el-button type="info" @click="toggleParamsSetForm(currentModel)" style="width: 80px;" color="#11659a">Cancel
        </el-button>
        <el-button type="info" @click="handleSubmit" style="width: 80px" color="#003d74">Submit</el-button>
      </div>
    </template>

    <template v-if="currentModel === 'edgeEffectMeasure'">
      <el-form-item label="input_raster" style="padding-top: 20px">
        <el-select v-model="computedOption.carbon_raster" placeholder="Select raster">
          <el-option v-for="layerId in getOriginLayersList" :label="layerId" :value="layerId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="simplify_raster" style="padding-top: 20px">
        <el-select v-model="computedOption.neighbor_extent" placeholder="Select Raster">
          <el-option v-for="layerId in getComputedLayersList" :label="layerId" :value="layerId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="output_table">
        <el-input v-model="computedOption.output_table"></el-input>
      </el-form-item>
      <el-form-item label="distance_class">
        <el-input v-model="computedOption.distance_class" type="number"></el-input>
      </el-form-item>
      <el-form-item label="edge_distance" style="padding-bottom: 20px">
        <el-input v-model="computedOption.edge_distance" type="number"></el-input>
      </el-form-item>
      <div style="display: inline-flex; justify-content: center; width: 100%; padding-bottom: 20px">
        <el-button type="info" @click="toggleParamsSetForm(currentModel)" style="width: 80px;" color="#11659a">Cancel</el-button>
        <el-button type="info" @click="handleSubmit" style="width: 80px" color="#003d74">Submit</el-button>
      </div>
    </template>
    <template v-if="currentModel === 'geoDetector'"></template>

  </el-form>
  <el-dialog v-model="dialogOn" title="Params Preview" width="300">
    <el-descriptions column="1">
      <el-descriptions-item align="center" span="2" v-for="[key, value] in Object.entries(params)" :label="key+' :'">{{ value }}
      </el-descriptions-item>
    </el-descriptions>
    <div style="display: inline-flex; justify-content: center; width: 100%; padding: 10px 0">
      <el-button type="info" @click="handleCompute" style="width: 80px" color="#003d74">Compute</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
#computed_btn {
  user-select: none;
  position: absolute;
  bottom: 5px;
  left: 10px;
}

.params_set_form {
  user-select: none;
  position: absolute;
  z-index: 10;
  left: 190px;
  bottom: 10px;
  border-radius: 20px;
  background: linear-gradient(45deg, #1cd6ce, #002f5f);
  background-size: 400% 400%;
  opacity: 0.9;

  h3 {
    text-align: center;
    font-size: 20px;
    color: #1c0249;
    margin-top: 10px;
    margin-bottom: 0;
  }

  .el-form-item {
    padding: 10px 20px;
    margin: 0;
  }
}
</style>

<style>
.el-form-item__label-wrap {
  justify-content: center;
  width: 40%;
  margin: 0 ! important;

  label {
    font-size: 18px;
    color: #1c0249;

  }
}

.el-input__wrapper {
  box-shadow: #2a2733 0 0 0 1px;
}

.el-input__wrapper.is-focus {
  box-shadow: #1c0249 0 0 0 2px;
}

.el-input__wrapper:hover:not(.is-focus) {
  box-shadow: #002f5f 0 0 0 0.5px;
}

.el-select__wrapper {
  box-shadow: #2a2733 0 0 0 1px;
}

.el-select__wrapper:hover {
  box-shadow: #1c0249 0 0 0 2px;
}

.el-select__wrapper.is-hovering:not(.is-focused) {
  box-shadow: #002f5f 0 0 0 0.5px;
}
.el-select__wrapper.is-focused {
  box-shadow: #1c0249 0 0 0 2px;
}

.el-popper {
  font-size: 14px;
  line-height: 2;
}
</style>