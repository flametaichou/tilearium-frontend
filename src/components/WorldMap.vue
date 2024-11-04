<template>
    <div class="world-map__wrapper">
        <div class="world-map__fps">
            FPS: {{ fps }}
        </div>
        <div class="world-map__center">
            Center: {{ center }}
        </div>
        <canvas
            id="pixi"
            class="world-map"
        ></canvas>

        <!--
        <div class="world-map__buttons">
            <button @click="moveMap2(0)">
                Влево
            </button>
            <button @click="moveMap2(1)">
                Вправо
            </button>
            <button @click="moveMap2(2)">
                Вниз
            </button>
            <button @click="moveMap2(3)">
                Вверх
            </button>
        </div>
        -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { WorldSimGame } from '@/game/game';
import { Point2D } from '@/classes/point2d';

export default defineComponent({
    name: 'WorldMap',

    props: {
        id: {
            type: String,
            required: true
        }
    },

    data: () => ({
        intervalId: null as number,
        fps: 0 as number,
        center: undefined as Point2D
    }),

    computed: {
        canvas: function (): HTMLCanvasElement {
            return document.getElementById('pixi') as HTMLCanvasElement;
        }
    },

    async mounted() {
        const game = new WorldSimGame(document.getElementById('pixi') as HTMLCanvasElement, this.id);
        
        game.init();

        this.intervalId = setInterval(() => {
            this.fps = game.fps;
            this.center = game.center;
        }, 300);
    },

    beforeUnmount(): void {
        //this.game.stop()
        clearInterval(this.intervalId);
    },

    methods: {
    }
});
</script>

<style scoped lang='scss'>
    /*
    .cell {
        &__wrapper {
            position: relative;
            margin: 10vw 5vh;
            border: 1px solid lightgray;
            min-height: 200px;
        }

        position: absolute;
        height: 5px;
        width: 5px;
        background-color: gray;
    }
    */

    .world-map {
        width: 100%;
        height: 100%;
        //border: 1px solid gray;

        &__wrapper {
            width: 100%;
            height: 100%;

            //background-color: black;
            background: radial-gradient(circle at bottom, #00212f 0, black 100%);

            //background: rgb(0,0,48);
            //background: radial-gradient(circle, rgba(0,0,48,1) 0%, rgba(0,50,108,1) 100%);
        }

        &__fps {
            position: absolute;
            top: 5px;
            left: 5px;
            background-color: rgba(255, 255, 255, 0.7);
            border: 1px solid gray;
            padding: 5px;
        }

        &__center {
            position: absolute;
            top: 64px;
            left: 5px;
            background-color: rgba(255, 255, 255, 0.7);
            border: 1px solid gray;
            padding: 5px;
        }
    }
</style>
