import { User } from 'oidc-client-ts';
import { createStore } from 'vuex';

const ACCOUNT_KEY = 'account';

function getAccount(): User {
    if (localStorage.hasOwnProperty(ACCOUNT_KEY)) {
        try { 
            return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
        } catch (e) {
            console.error('Error on parsing stored user data: ' + e);
        }
    }

    return undefined;
}

export default createStore({
    state: {
        code: undefined,
        account: getAccount()
    },
    mutations: {
        setCode(state, code) {
            state.code = code;
        },
        setAccount(state, account) {
            state.account = account;

            if (account) {
                localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
            } else {
                localStorage.removeItem(ACCOUNT_KEY);
            }
        }
    },
    actions: {
        authorize(context, response) {
            context.commit('setAccount', response);
        }
    },
    modules: {

    }
});
