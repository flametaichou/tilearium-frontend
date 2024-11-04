<template>
    <div class="login">
        <div class="login__bg"></div>

        <div class="login__form">
            <div class="login__logo">
                <img src="@/assets/logo.png">
            </div>

            <div class="login__description">
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

@keyframes moveIt {
    0% {
        background-position-x: 0;
    }
    100% {
        background-position-x: 100%; 
    }
}

.login {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--black);

    &__bg {
        z-index: 0;
        height: 100%;
        width: 100%;
        position: absolute;
        background: url('@/assets/img/background.png') 100%;
        background-repeat: repeat-x;
        background-size: cover;
        animation: moveIt 10s linear infinite;
        filter: blur(10px) brightness(0.8);
        
    }

    &__form {
        z-index: 1;
        color: var(--white);
        text-shadow: 1px 1px 2px var(--black);
    }

    &__description {
        margin-top: 16px;
    }

    &__actions {
        margin-top: 16px;
    }
}

</style>