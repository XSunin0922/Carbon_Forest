import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
    plugins: [vue(), cesium()],
    server: {
        port: 4000,
        proxy: {
            '/geoserver': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    }
})
