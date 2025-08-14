<template>
    <div class="app">
        <div class="loader" v-if="loading">
            <div class="loader__line"></div>
        </div>
        <router-view/>
        <toasts/>
    </div>
</template>

<script setup lang="ts">
import Toasts from './Toasts.vue';
import { auth } from './service/auth.service';
import { ref } from 'vue';

const loading = ref(true);

auth.processCallback().then(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
    loading.value = false;
});

</script>

<style lang="scss">
    .app {
        height: 100vh;
        overflow-y: auto;
    }
</style>
