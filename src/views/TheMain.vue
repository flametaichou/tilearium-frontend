<template>
    <div id="nav">
        <router-link to="/">Home</router-link>
        |
        <router-link to="/game">Game</router-link>
        |
        <router-link to="/about">About</router-link>
        |
        <a @click="logOut()" href="#">Log out</a>
    </div>
    <router-view/>
</template>

<script lang="ts">
import { UserManager } from 'oidc-client-ts';
import { defineComponent, inject } from 'vue';
import { Store, useStore } from 'vuex';

export default defineComponent({
    name: 'TheMain',

    data: () => ({
        userManager: undefined as UserManager,
        store: undefined as Store<object>
    }),

    mounted(): void {
        this.userManager = inject('userManager');
        this.store = useStore(); 
    },

    methods: {
        logOut(): void {
            /*
            this.userManager.signoutRedirect().then(() => {
            });
            */
            this.store.dispatch('authorize', undefined);
        }
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