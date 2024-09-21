<script setup>
import {ref} from 'vue'

const computedModel = ref([
  {name: 'publishLayer'},
  {name: 'InVESTCarbonModel'},
  {name: 'simplifyRaster'},
  {name: 'neighborRecognition'},
  {name: 'edgeEffectMeasure'},
  {name: 'geoDetector'},
]);
const formOn = ref(false);
const computedOption = ref({});

const handleCompute = (model_name) => {
  // debug
  console.log(model_name);
  formOn.value = !formOn.value;
  switch (model_name) {
    case 'publicLayer':
      break;
    case 'InVESTCarbonModel':
      break;
    case 'simplifyRaster':
      break;
    case 'neighborRecognition':
      break;
    case 'edgeEffectMeasure':
      break;
    case 'geoDetector':
      break;
  }
}
</script>

<template>
  <el-dropdown>
    <button class="btn" id="computed">computed</button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="model in computedModel" @click="handleCompute(model.name)">{{ model.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
      <el-form v-if="formOn" v-model="computedOption" label-width="auto" style="max-width: 400px">

      </el-form>
    </template>
  </el-dropdown>
</template>

<style scoped>

</style>