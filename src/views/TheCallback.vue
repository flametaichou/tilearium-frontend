<template>

    <h1>Auth success</h1>
</template>


<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'TheCallback',

        data: () => ({
        }),

        created(): void {
            const params = this.$route.query;
            alert(JSON.stringify(params));

            //signinCallback()
            //this.$router.push(redirectPath);
        },

        methods: {

        }
    });
</script>

<style scoped>

</style>