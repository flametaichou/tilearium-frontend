<template>
    <div :id="'game-' + id"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { WorldSimGame } from '@/game/game';

// Don't make it reactive, it will impact performance a lot
let game: WorldSimGame = null;

export default defineComponent({
    name: 'WorldMap',

    props: {
        id: {
            type: String,
            required: true
        }
    },

    data: () => ({
    }),

    computed: {
    },

    async mounted() {
        game = new WorldSimGame(document.getElementById('game-' + this.id) as HTMLDivElement, this.id);
        game.init();
    },

    beforeUnmount(): void {
        game.stop();
    },

    methods: {
    }
});
</script>

<style scoped lang='scss'>
</style>
