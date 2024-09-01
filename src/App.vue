<script setup>
import {useRouter} from "vue-router";

const router = useRouter();

function navigateTo(path) {
  router.push(path);
}
</script>

<template>
  <!--  <nav>-->
  <!--    <router-link to="/">Home</router-link> |-->
  <!--    <router-link to="/heatmap">HeatMap</router-link>-->
  <!--  </nav>-->
  <nav>
    <el-link @click="navigateTo('/')" icon="ToiletPaper" :underline="false">Home</el-link> |
    <el-link @click="navigateTo('/Heatmap')" icon="PictureRounded" :underline="false">HeatMap</el-link>
  </nav>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped>
main {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

nav {
  top: 20px;
  width: 100%;
  position: absolute;
  z-index: 1;
  text-align: center;
}

nav a {
  color: #002f5f;
  font-family: "Microsoft YaHei";
  font-size: 20px;
}
</style>
