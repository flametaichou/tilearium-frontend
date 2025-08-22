import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/assets/css/ui-kit.css';
import '@/views/game/game.scss';

createApp(App)
    .use(store)
    .use(router)
    .mount('#app');
