<template>
    <div class="login">
        <div class="login__form">
            <div class="login__logo">
                <img src="@/assets/logo.png">
            </div>

            <div class="login__description text-white ">
                <strong>WorldSim</strong> - is a game where you need to find something in a simulated world
            </div>
                
            <div class="login__actions">
                <button class="secondary large" @click="logIn()">
                    Log in with Google
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue';
import { UserManager } from 'oidc-client-ts';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const userManager: UserManager = inject('userManager');
const router = useRouter();
const store = useStore();

onMounted(() => {
    const user = store.state.account;

    if (user) {
        router.push('/');
    }

    //userManager.startSilentRenew();    

    /*
    userManager.signinSilentCallback()
        .then(() => {
            router.push('/');
            alert('Successfully logged id');
        })
        .catch((error) => {
            console.error(error);
        });
        */
});

function logIn(): void {
    userManager.signinRedirect().then(() => {
    });
}

</script>

<style scoped lang="scss">

.login {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__form {
    }

    &__description {
        margin-top: 16px;
    }

    &__actions {
        margin-top: 16px;
    }
}

</style>