<template>
    <div id="nav">
        <router-link to="/">Home</router-link>
        |
        <router-link to="/game">Game</router-link>
        |
        <router-link to="/about">About</router-link>
    </div>
    <router-view/>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'TheMain',

        data: () => ({

        }),

        mounted(): void {

        },

        methods: {

        }
    });
</script>

<style scoped lang="scss">
    #nav {
        padding: 30px;

        a {
            font-weight: bold;
            color: #2c3e50;

            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }
</style>