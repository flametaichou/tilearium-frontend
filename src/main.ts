import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/assets/css/ui-kit.css';
import { UserManagerSettings, UserManager } from 'oidc-client-ts';
import '@/views/game/game.scss';

const settings: UserManagerSettings = {
    authority: process.env.VUE_APP_AUTH_SERVER_URL,
    client_id: process.env.VUE_APP_AUTH_CLIENT_ID,
    client_secret: process.env.VUE_APP_AUTH_CLIENT_SECRET,
    redirect_uri: window.location.origin + '/auth',
    //popup_redirect_uri: window.location.origin + '/auth',
    //silent_redirect_uri: window.location.origin + '/silent-renew',
    post_logout_redirect_uri: window.location.origin + '/auth',
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true
};

const userManager = new UserManager(settings);

createApp(App)
    .use(store)
    .use(router)
    .provide('userManager', userManager)
    .mount('#app');
