import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue';

import './assets/main.css'
// import 'ant-design-vue/dist/antd.css';
import 'ant-design-vue/dist/antd.dark.css';
// import '@ant-design/icons-vue';


const app = createApp(App)

app.use(Antd);
app.use(createPinia())

app.mount('#app')
