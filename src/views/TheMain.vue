<template>
    <div class="main">
        <div class="main__header">
            <div class="main__logo">
                <img src="@/assets/logo.png">
            </div>

            <div class="main__spacer"></div>

            <div></div>

            <!--
            <router-link to="/">Home</router-link>
            |
            <router-link to="/game">Game</router-link>
            |
            <router-link to="/about">About</router-link>
            -->
        </div>

        <div class="main__content">
            <router-view/>
        </div>
    </div>
</template>

<script lang="ts">
import { User, UserManager } from 'oidc-client-ts';
import { defineComponent, inject } from 'vue';
import { Store, useStore } from 'vuex';

export default defineComponent({
    name: 'TheMain',

    data: () => ({
        /*
        userManager: undefined as UserManager,
        store: undefined as Store<{ account: User }>
        */
    }),

    computed: {
        /*
        user: function (): User {
            return this.store?.state.account;
        }
        */
    },

    created(): void {
        /*
        this.userManager = inject('userManager');
        this.store = useStore(); 
        */
    },

    methods: {
        /*
        logOut(): void {
            this.store.dispatch('authorize', undefined);
        }
        */
    }
});
</script>

<style scoped lang="scss">
    .main {
        height: 100%;
        display: flex;
        flex-direction: column;

        &__header {
            display: flex;
            padding: 10px 16px;
        }

        &__content {
            flex: 1 0;
            //background-color: var(--gray1);
        }

        &__logo {
            img {
                height: 32px;
            }
        }

        &__spacer {
            flex: 1 0;
        }
    }
</style>