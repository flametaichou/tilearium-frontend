<template>
    <div class="app">
        <div class="app__left">
            <div class="app__bg"></div>
            <router-view/>
        </div>
        <div class="app__right">
            <the-login></the-login>
        </div>
        <toasts/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Toasts from './components/Toasts.vue';
import TheLogin from './views/TheLogin.vue';

export default defineComponent({
    name: 'App',
    components: {
        Toasts,
        TheLogin
    }
});
</script>

<style lang="scss">
    @keyframes moveIt {
        0% {
            background-position-x: 0;
        }
        100% {
            background-position-x: 100%; 
        }
    }

    .text-white {
        color: var(--white) !important;
        text-shadow: 1px 1px 2px var(--black);
    }

    .sidebar {
    }

    .app {
        display: flex;
        height: 100vh;

        &__bg {
            z-index: -1;
            height: 100%;
            width: 100%;
            position: absolute;
            background: url('@/assets/img/background.png') 100%;
            background-repeat: repeat-x;
            background-size: cover;
            animation: moveIt 30s linear infinite;
            filter: blur(10px);
            opacity: 0.4;
            
        }

        &__left {
            z-index: 0;
            position: relative;
            flex: 1 0;
            background-color: var(--gray4);
        }

        &__right {
            z-index: 1;
            max-width: 500px;
            min-width: 400px;
            background-color: var(--white);
            padding: 10px;
            // TODO: animated removal
        }
    }
</style>
