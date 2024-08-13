import { createRouter, createWebHistory} from "vue-router";
import Map from "../components/Map.vue";
import olHeatmap from "../components/olHeatMap.vue";

const routes = [
    {path: "/", component: Map, meta: {transition: 'slide-left'}},
    {path: "/heatmap", component: olHeatmap, meta: {transition: 'slide-right'}},
];

const router = createRouter({
    history: createWebHistory(),
    mode: "history",
    routes: routes
});

export default router;