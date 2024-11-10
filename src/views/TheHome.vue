<template>
    <div class="home">
        <div v-if="loading" class="loader">
            <div class="loader__line"></div>
        </div>

        <Teleport to="body">
            <world-creation-modal v-if="creationDialogOpen" @submit="creationDialogOpen = false"></world-creation-modal>
        </Teleport>

        <button class="home__card primary block" @click="creationDialogOpen = true">
            <span class="icon plus white mr-1"></span>
            Create a new game
        </button>

        <div v-for="game in games" :key="game.id" class="home__card card card--hover">
            <div class="card__title">
                {{ game.name }}
            </div>
            <div class="card__content">
            </div>
            <div class="card__footer">
                <button v-if="game.generated" class="secondary" @click="joinWorld(game.id)">
                    Join
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { worldApi } from '@/api/world.api';
import { World } from '@/classes/world';
import WorldCreationModal from '@/components/WorldCreationModal.vue';
import { dialogService } from '@/service/dialog.service';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'TheMain',

    components: {
        WorldCreationModal
    },

    data: () => ({
        games: [] as World[],
        loading: false as boolean,
        creationDialogOpen: false as boolean
    }),

    computed: {
    },

    created(): void {
        this.loading = true;

        worldApi.getWorlds()
            .then((response) => {
                this.games = response.data;
            })
            .catch((e) => {
                dialogService.toastError(e);
            })
            .finally(() => {
                this.loading = false;
            });
    },

    methods: {
        addWorld(): void {

        },

        joinWorld(worldId: string): void {
            this.$router.push(`/game/${worldId}`);
        }
    }
});
</script>

<style scoped lang="scss">
    .home {
        display: grid;
        //grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        gap: 1em;
        row-gap: 1em;
        padding: 0 1em;

        &__card {
            height: 64px;
            display: flex;
            align-items: center;
        }
        
        .card__content {
            flex: 1 0;
        }
    }
</style>