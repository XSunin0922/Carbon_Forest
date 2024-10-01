import { createRouter, createWebHistory} from "vue-router";

const routes = [
    {path: "/", component: () => import("../components/Map.vue"), meta: {transition: 'slide-left'}},
    {path: "/heatmap", component: () => import("../components/olHeatMap.vue"), meta: {transition: 'slide-right'}},
];

const router = createRouter({
    history: createWebHistory(),
    mode: "history",
    routes: routes
});

export default router;