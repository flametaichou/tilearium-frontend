<template>
    <div class="game">
        <div :id="'game-' + gameId"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { WorldSimGame } from '@/views/game/game';

// Don't make it reactive, it will impact performance a lot
let game: WorldSimGame = null;

export default defineComponent({
    name: 'TheHome',

    /*
    props: {
        id: {
            type: String,
            required: true
        }
    },
    */

    data: () => ({
        gameId: null as string
    }),

    computed: {
    },

    created(): void {
        this.gameId = this.$route.params.gameId.toString();
    },

    async mounted() {
        game = new WorldSimGame(document.getElementById('game-' + this.gameId) as HTMLDivElement, this.gameId);
        game.init();
    },

    beforeUnmount(): void {
        game.stop();
    },

    methods: {
    }
});
</script>

<style scoped lang="scss">
    .game {
        //width: 100vw;
        height: 100vh;
    }
</style>