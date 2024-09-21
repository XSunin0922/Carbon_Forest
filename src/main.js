import { createApp } from 'vue';
import './style.css';
import 'element-plus/dist/index.css';
import App from './App.vue';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router';
import {createPinia} from "pinia";

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router).use(pinia).use(ElementPlus).mount('#app');
