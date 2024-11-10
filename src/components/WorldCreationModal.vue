<template>
    <div class="modal card">
        <div class="card__title">
        </div>

        <div class="card__content">
            <div>
                <label>Name</label>
                <input type="text" v-model="world.name">
            </div>
            <div>
                <label>Size</label>
                <input type="number" v-model="world.size">
            </div>
            <div>
                <label>Timer</label>
                <input type="number" v-model="world.timer">
            </div>
        </div>

        <div class="card__footer">
            <button class="primary" :disabled="loading" @click="submit()">Create</button>
            <button @click="close()">Cancel</button>
        </div>
    </div>
</template>

<script lang="ts">
import { worldApi } from '@/api/world.api';
import { WorldRequest } from '@/classes/world-request';
import { dialogService } from '@/service/dialog.service';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'WorldCreationDialog',

    data: () => ({
        world: {} as WorldRequest,
        loading: false as boolean
    }),

    computed: {
    },

    created(): void {
    },

    methods: {
        submit(): void {
            this.loading = true;

            worldApi.submitWorld(this.world)
                .then(() => {
                    this.$emit('submit', this.world);
                })
                .catch((e) => {
                    dialogService.toastError(e);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        close(): void {
            this.$emit('submit');
        }
    }
});

</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>