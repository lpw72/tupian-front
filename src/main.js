import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// 导入Element Plus和Ant Design
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Antd from 'ant-design-vue';
// 修复Ant Design Vue的CSS导入路径
import 'ant-design-vue/dist/reset.css';

// 正确创建并配置应用实例
const app = createApp(App);
app.use(store);
app.use(router);
app.use(ElementPlus);
app.use(Antd);
app.mount('#app');

store.dispatch('initUser');


