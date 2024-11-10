import { Toast } from '@/classes/toast';
import { removeFromArray } from '@/utils/array-utils';
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
        account: getAccount() as User,
        toasts: [] as Toast[]
    },
    mutations: {
        setAccount(state, account) {
            state.account = account;

            if (account) {
                localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
            } else {
                localStorage.removeItem(ACCOUNT_KEY);
            }
        },

        addToast(state, toast) {
            state.toasts.push(toast);
        },

        removeToast(state, toast) {
            state.toasts = removeFromArray(state.toasts, toast);
        }
    },
    actions: {
        authorize(context, response) {
            context.commit('setAccount', response);
        },
        
        addToast(context, toast) {
            context.commit('addToast', toast);

            setTimeout(() => {
                context.commit('removeToast', toast);
            }, 5000);
        }
    },
    modules: {

    }
});
