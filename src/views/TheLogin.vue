<template>
    |
    <button @click="logIn()">Login</button>
</template>


<script lang="ts">
    import { defineComponent } from 'vue';
    import { UserManager } from 'oidc-client-ts';
    import { useStore } from 'vuex';

    export default defineComponent({
        name: 'TheLogin',

        data: () => ({
            settings: {
                authority: 'https://accounts.google.com',
                client_id: process.env.VUE_APP_CLIENT_ID,
                redirect_uri: window.location.origin + '/auth',
                popup_redirect_uri: window.location.origin + '/auth',
                silent_redirect_uri: window.location.origin + '/silent-renew',
                post_logout_redirect_uri: window.location.origin + '/auth',
                response_type: 'code', // 'token id_token'
                scope: 'openid profile email',
                automaticSilentRenew: true,
            },
            userManager: null as UserManager
        }),

        mounted(): void {
            // https://github.com/authts/sample-angular-oidc-client-ts/blob/main/src/app/core/services/auth.service.ts
            this.userManager = new UserManager(this.settings);
            this.userManager.signinSilentCallback().catch(error => {
                console.error(error);
            });
        },

        methods: {
            logIn(): void {
                this.userManager.signinRedirect().then((user) => {
                    alert(JSON.stringify(user));
                    useStore().dispatch('authorize', user);
                });
            }
        }
    });
</script>

<style scoped>

</style>