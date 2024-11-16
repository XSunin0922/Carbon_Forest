import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import cesium from 'vite-plugin-cesium';
import os from 'os';

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

export default defineConfig({
    plugins: [vue(), cesium()],
    server: {
        host: '0.0.0.0',  // 监听所有网络接口
        port: 4000,
        proxy: {
            '/geoserver': {
                // 热点地址
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
            }
        },
        onListening(server) {
            const address = server.httpServer.address();
            const localAddress = `http://localhost:${address.port}`;
            const networkAddress = `http://${getLocalIPAddress()}:${address.port}`;
            console.log(`Local: ${localAddress}`);
            console.log(`Network: ${networkAddress}`);
        }
    }
});
