<script setup>

</script>

<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/heatmap">HeatMap</router-link>
  </nav>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
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
  width: 100%;
  position: absolute;
  z-index: 1;
  text-align: center;
  font-size: 20px;
  font-family: "Microsoft YaHei";
  color: black;
}
</style>
