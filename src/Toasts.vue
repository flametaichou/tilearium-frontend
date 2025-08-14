<template>
    <section class="toasts">
        <transition-group appear name="slide-up">
            <output 
                role="status" 
                class="toast" 
                :class="'toast--' + toast.type" 
                v-for="(toast, index) in toasts" 
                :key="'toast-' + index"
            >
                <strong>{{ toast.type.toUpperCase() }}</strong>
                <div>
                    {{ toast.message }}
                </div>
            </output>
        </transition-group>
    </section>
</template>

<script lang="ts">
import { Toast } from '@/classes/toast';
import { defineComponent } from 'vue';
import { Store, useStore } from 'vuex';

export default defineComponent({
    name: 'ToastsContainer',

    data: () => ({
        store: undefined as Store<{ toasts: Toast[] }>
    }),

    computed: {
        toasts: function (): Toast[] {
            return this.store.state.toasts;
        }
    },

    created(): void {
        this.store = useStore(); 
    },

    methods: {
    }
});

</script>

<style scoped lang="scss">
    .slide-up-enter-active, .slide-up-leave-active {
        transition: transform .3s, opacity .3s;
    }
    .slide-up-enter, .slide-up-leave-to {
        transform: translateY(0, 100%);
        opacity: 0;
    }

    .toasts {
        display: flex;
        flex-direction: column-reverse;
        gap: 8px;
        pointer-events: none;
        position: absolute;
        bottom: 0;
        width: 100%;
        align-items: center;
        overflow-y: hidden;
    }

    .toast {
        width: 600px;
        padding: 16px 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        z-index: 2;
    
        &--info {
            background-color: var(--white);
            border: 1px solid var(--gray1);
            color: var(--black);
        }
    
        &--error {
            background-color: var(--error);
            border: 1px solid var(--error-darken1);
            color: var(--white);
        }
    }
</style>