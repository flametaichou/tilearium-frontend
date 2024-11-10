<template>
    <h1>Auth in progress...</h1>
</template>

<script lang="ts">
import { dialogService } from '@/service/dialog.service';
import { UserManager } from 'oidc-client-ts';
import { defineComponent, inject } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    name: 'TheCallback',

    data: () => ({
    }),

    created(): void {
        const userManager: UserManager = inject('userManager');
        const store = useStore();

        userManager.signinRedirectCallback()
            .then((user) => {
                store.dispatch('authorize', user);
                this.$router.push('/');
            })
            .catch((e) => {
                dialogService.toastError(e);
            });
    },

    methods: {

    }
});
</script>

<style scoped>

</style>