import { createStore } from 'vuex';

export default createStore({
    state: {
        code: undefined,
        account: undefined
    },
    mutations: {
        setCode (state, code) {
            state.code = code;
        }
    },
    actions: {
        authorize (context, response) {
            context.commit('setCode', response)
        }
    },
    modules: {

    }
});
