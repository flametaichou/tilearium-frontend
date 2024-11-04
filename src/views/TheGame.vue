<template>
    <div class="game">
        <world-map :id="'6df1bbd8-45b0-4b01-95a4-0ba47efbd103'"></world-map>
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