<template>
    <div class="game">
        <world-map :id="worldId"></world-map>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WorldMap from '@/components/WorldMap.vue'; // @ is an alias to /src

export default defineComponent({
    name: 'TheHome',
    components: {
        WorldMap
    },

    data: () => ({
        worldId: null as string
    }),

    created(): void {
        this.worldId = this.$route.params.worldId.toString();
    }
});
</script>

<style scoped lang="scss">
    .game {
        //width: 100vw;
        height: 100vh;
    }
</style>