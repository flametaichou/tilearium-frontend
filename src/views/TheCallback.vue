<template>
    <h1>Auth in progress...</h1>
</template>

<script lang="ts">
import { UserManager } from 'oidc-client-ts';
import { defineComponent, inject } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    name: 'TheCallback',

    data: () => ({
    }),

    created(): void {
        //const params = this.$route.query;
        //alert(JSON.stringify(params));

        const userManager: UserManager = inject('userManager');
        const store = useStore();

        userManager.signinRedirectCallback()
            .then((user) => {
                store.dispatch('authorize', user);
                this.$router.push('/');
            })
            .catch((e) => {
                alert(e);
            });
    },

    methods: {

    }
});
</script>

<style scoped>

</style>