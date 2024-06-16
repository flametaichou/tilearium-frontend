<template>
    <div class="game">
        <world-map :id="'18e8a29d-bc74-41f5-84c9-c194bda29417'"></world-map>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WorldMap from '@/components/WorldMap.vue'; // @ is an alias to /src

export default defineComponent({
    name: 'TheHome',
    components: {
        WorldMap
    }
});
</script>

<style scoped lang="scss">
    .game {
        //width: 100vw;
        height: 100vh;
    }
</style>