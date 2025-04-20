<template>
    <div class="sidebar">
        <div>
            <div v-if="user" class="account">
                <img class="account__avatar" :src="user?.profile?.picture">
                <span class="account__name text-white" >
                    {{ user?.profile?.name }}
                </span>
                <!--
                <a class="account__logout text-white" @click="logOut()" href="#">Log out</a>
                -->
            </div>
            <div v-else>
                <button class="secondary block" @click="logIn()">
                    Log in with Google
                </button>
            </div>
        </div>

        <div>
            <button class="secondary large block" :disabled="!user" @click="play()">
                {{ unfinishedGameId ? 'Resume game' : 'Play' }}
            </button>
        </div>

        <Teleport to="body">
            <world-creation-modal 
                v-if="creationDialogOpen" 
                @submit="(gameId: string) => { creationDialogOpen = false; joinGame(gameId); }"
            ></world-creation-modal>

            <enter-code-modal 
                v-if="enterCodeDialogOpen" 
                @submit="(gameId: string) => { enterCodeDialogOpen = false; joinGame(gameId) }"
            ></enter-code-modal >
        </Teleport>

        <div>
            <button class="primary" :disabled="!user" @click="newGame()">
                <span class="icon plus white mr-1"></span>
                Create a new game
            </button>
            <button class="primary" :disabled="!user" @click="enterCode()">
                Join game
            </button>
        </div>

        <div class="sidebar__spacer"></div>

        <div v-if="user">
            <button class="error large block" @click="logOut()">
                Log Out
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { UserManager } from 'oidc-client-ts';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import WorldCreationModal from '@/components/WorldCreationModal.vue';
import EnterCodeModal from '@/components/EnterCodeModal.vue';
import { authApi } from '@/api/auth.api';
import { gameApi } from '@/api/game.api';
import { dialogService } from '@/service/dialog.service';

const userManager: UserManager = inject('userManager');
const router = useRouter();
const store = useStore();

const user = computed(() => store.state.account);

const creationDialogOpen = ref(false);
const enterCodeDialogOpen = ref(false);

const loading = ref(false);
const unfinishedGameId = ref(null);

onMounted(() => {
    /*
    const user = store.state.account;

    if (user) {
        router.push('/');
    }
    */

    /*
    userManager.startSilentRenew();    

    userManager.signinSilentCallback()
        .then(() => {
            //router.push('/');
            //alert('Successfully logged id');
        })
        .catch((error) => {
            console.error(error);
        });
    */

    authApi.check()
        .then(() => {
            console.log('User is authenticated');
            fetchGameData();
        })
        .catch((error) => {
            // TODO: refresh

            dialogService.toastError('Error on checking user authentication: ' + error);
            //dialogService.toastError('Unauthorized error: ' + getErrorMessage(error));
            //store.dispatch('authorize', undefined);
            //router.push('/');
        });
});

function fetchGameData(): void {
    loading.value = true;
    gameApi.unfinished()
        .then((response) => {
            unfinishedGameId.value = response.data;
        })
        .catch((error) => {
            dialogService.toastError('Error on loading unfinished game data: ' + error);
        })
        .finally(() => {
            loading.value = false;
        });
}

async function play(code?: string): Promise<void> {
    let gameId = undefined;

    if (!code && unfinishedGameId.value) {
        gameId = unfinishedGameId.value;
        
    } else {
        gameId = await gameApi.findGame(code)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                dialogService.toastError('Error on finding game: ' + error);
            })
            .finally(() => {
            });
    }

    joinGame(gameId);
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

function logIn(): void {
    userManager.signinRedirect().then(() => {
        fetchGameData();
    });
}

function logOut(): void {
    /*
    this.userManager.signoutRedirect().then(() => {
    });
    */
    store.dispatch('authorize', undefined);
}
</script>

<style scoped lang="scss">
.sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__spacer {
        flex: 1 0;
    }
}

.account {
    display: flex;
    align-items: center;
    gap: 16px;

    &__avatar {
        height: 32px;
        border-radius: 50%;
    }

    &__name {
         
    }

    &__logout {
        font-weight: bold;

    }
}
</style>