<template>
    <div class="main">
        <div class="background"></div>

        <div class="main__header">
            <div class="spacer"></div>
        </div>

        <div class="main__content">

            <!--
            <div class="left">
            </div>
            <div class="right"  :class="{ 'right--hidden' : hidden }">
            </div>
            -->

            <div class="header">
                <div class="header__logo">
                    <img src="@/assets/logo.png">
                </div>

                <div class="header__description">
                    <strong>Tilearium</strong> - is a game where you need to find something in a tiled world
                </div>
            </div>

            <div class="card card--shadow">
                <div class="card__content login">

                    <div v-if="user" class="account">
                        <img class="account__avatar" :src="user?.profile?.picture || emptySvg">
                        <span class="account__name" >
                            {{ user?.profile?.name }}
                        </span>
                        <div class="spacer">

                        </div>
                        <!--
                        <a class="account__logout" @click="logOut()" href="#">Log out</a>
                        -->
                        <button class="error" @click="logOut()">
                            Log Out
                        </button>
                    </div>
                    <div v-else class="account">
                        <img class="account__avatar" :src="user?.profile?.picture || emptySvg">
                        <span class="account__name" >
                            You are not logged in
                        </span>
                        <div class="spacer">

                        </div>

                        <button 
                            class="login__btn" 
                            :style="logInButtonProps.style"
                            @click="logIn()"
                        >
                            <img :src="logInButtonProps.icon" height="16px"/>

                            Log in {{ logInButtonProps.name ? (' with ' + logInButtonProps.name) : '' }}
                        </button>
                    </div>
                </div>
            </div>

            <div  class="card card--shadow menu">

                <div class="card__content menu__buttons">

                    <div>
                        <button class="secondary large block" :disabled="!user" @click="play()">
                            {{ unfinishedGameId ? 'Resume game' : 'Play' }}
                        </button>
                    </div>

                    <Teleport to="body">
                        <world-creation-modal 
                            v-if="creationDialogOpen" 
                            @submit="creationDialogCallback"
                        ></world-creation-modal>

                        <enter-code-modal 
                            v-if="enterCodeDialogOpen" 
                            @submit="enterCodeDialogCallback"
                        ></enter-code-modal >
                    </Teleport>

                    <button class="primary block" :disabled="!user" @click="newGame()">
                        <span class="icon plus white mr-1"></span>
                        Create a new game
                    </button>
                    <button class="primary block" :disabled="!user" @click="enterCode()">
                        Join game
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { User } from 'oidc-client-ts';
import { computed, ComputedRef, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import WorldCreationModal from '@/views/menu/WorldCreationModal.vue';
import EnterCodeModal from '@/views/menu/EnterCodeModal.vue';
import { authApi } from '@/api/auth.api';
import { gameApi } from '@/api/game.api';
import { dialogService } from '@/service/dialog.service';
import { AxiosError } from 'axios';
import lockSvg from '@/assets/img/auth.svg';
import emptySvg from  '@/assets/img/empty.svg';
import { auth } from '@/service/auth.service';
import getEnv from '@/utils/env';

const router = useRouter();

const loading = ref(false);
const user = ref(auth.getAccount());

const onUserChanged = (e: CustomEvent<{ user: User }>) => {
    user.value = e.detail.user;
};

document.addEventListener('tilearium:user', onUserChanged);

onBeforeUnmount(async () => {
    document.removeEventListener('tilearium:user', onUserChanged);
});

onMounted(() => {
    if (user.value) {
        // User is authenticated

        loading.value = true;
        authApi.check()
            .then(() => {
                console.log('User is authenticated');
                fetchGameData();
            })
            .catch((error: AxiosError) => {
                dialogService.toastError('Error on checking user authentication: ' + error);

                if (error.response?.status === 401) {
                    console.log('Refreshing token...');
                    auth.setAccount(null);
                    auth.logIn();
                } 
            })
            .finally(() => {
                loading.value = false;
            });

    } else {
        // User is not authenticated
    }

});

const logInButtonProps: ComputedRef<{
    name?: string,
    icon: string,
    style: {
        backgroundColor: string
    }
}> = computed(() => { 
    return {
        name: getEnv('VUE_APP_AUTH_NAME'),
        icon: getEnv('VUE_APP_AUTH_ICON') || lockSvg,
        style: {
            backgroundColor: getEnv('VUE_APP_AUTH_COLOR') || 'var(--secondary)',
            color: getEnv('VUE_APP_AUTH_TEXT_COLOR') || 'var(--white)'
        }
    };
});

function logIn(): void {
    auth.logIn();
}

function logOut(): void {
    auth.logOut();
}

const creationDialogOpen = ref(false);
const enterCodeDialogOpen = ref(false);

const creationDialogCallback = (gameId?: string) => { 
    creationDialogOpen.value = false; 

    if (gameId) {
        joinGame(gameId); 
    }
};

const enterCodeDialogCallback = (gameId?: string) => { 
    enterCodeDialogOpen.value = false; 

    if (gameId) {
        joinGame(gameId); 
    }
};

const gameDataLoading = ref(false);
const unfinishedGameId = ref(null);

function fetchGameData(): void {
    gameDataLoading.value = true;
    gameApi.unfinished()
        .then((response) => {
            unfinishedGameId.value = response.data;
        })
        .catch((error) => {
            dialogService.toastError('Error on loading unfinished game data: ' + error);
        })
        .finally(() => {
            gameDataLoading.value = false;
        });
}

async function play(code?: string): Promise<void> {
    let gameId = undefined;
    let error = undefined;

    if (!code && unfinishedGameId.value) {
        gameId = unfinishedGameId.value;
        
    } else {
        gameId = await gameApi.findGame(code)
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                error = 'Error on finding game: ' + e;
            })
            .finally(() => {
            });
    }

    if (gameId) {
        joinGame(gameId);

    } else {
        dialogService.toastError(`Can not find a game to play (${error})`);
    }
}

function newGame(): void {
    creationDialogOpen.value = true;
}

function enterCode(): void {
    enterCodeDialogOpen.value = true;
}

function joinGame(gameId: string): void {
    router.push(`/game/${gameId}`);
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

.background {
    z-index: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    background: url('@/assets/img/background.png') 100%;
    background-repeat: repeat-x;
    background-size: cover;
    animation: moveIt 30s linear infinite;
    filter: blur(10px);
    opacity: 0.4;
}

/*

        .left {
            z-index: 0;
            position: relative;
            flex: 1 0;
            background-color: var(--gray4);
            overflow-y: auto;
        }

        .right {
            z-index: 1;
            max-width: 500px;
            //min-width: 400px;
            background-color: var(--white);
            transition: max-width ease 0.3s;
            display: flex;

            &--hidden {
                max-width: 0;
                min-width: 0;
                overflow-x: hidden;
                //transform: translateX(100%);
            }
        }
        */

.main {
    height: 100%;
    display: flex;
    flex-direction: column;
    //z-index: 0;
    background-color: var(--gray4);

    &__header {
        display: flex;
        padding: 10px 16px;
    }

    &__content {
        z-index: 1;
        flex: 1 0;
        //background-color: var(--gray1);
        width: min(calc(100% - 32px), 400px);
        margin-left: auto;
        margin-right: auto;

        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        //align-items: center;
        justify-content: center;
    }

    &__logo {
        img {
            height: 32px;
        }
    }
}

.header {
    text-align: center;
    padding-top: 16px;
    padding-bottom: 16px;

    &__logo {

    }

    &__description {
        //margin-top: 16px;
        color: var(--white);
        margin-top: 8px;
    }
}

.login {
    text-align: center;
    padding-top: 16px;
    padding-bottom: 16px;

    &__btn {
        display: flex;
        align-items: center;
        gap: 12px;
    }
}

.account {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    &__avatar {
        height: 32px;
        border-radius: 50%;
    }

    &__name {
        //color: var(--white);
    }

    &__logout {
        font-weight: bold;
        //color: var(--white);
    }
}

.spacer {
    flex: 1 0;
}

.menu {
    margin-top: 16px;
    min-width: 300px;
    padding-top: 16px;
    padding-bottom: 16px;

    &__buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
}

</style>