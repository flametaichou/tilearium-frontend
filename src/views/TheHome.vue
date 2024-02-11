<template>
    <div class="home">
        <WorldMap :id="'6df1bbd8-45b0-4b01-95a4-0ba47efbd103'"></WorldMap>
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

<style scoped lang='scss'>
    .home {
        //width: 100vw;
        height: 80vh;
    }
</style>