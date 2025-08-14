import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Game from '../views/game/TheGame.vue';
import Main from '../views/TheMain.vue';
import { useStore } from 'vuex';
import { auth } from '@/service/auth.service';
import { dialogService } from '@/service/dialog.service';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Main',
        component: Main,
        meta: {
            authorize: false
        }
    },
    {
        path: '/auth',
        redirect: '/'
    },
    {
        path: '/game/:gameId',
        name: 'Game',
        component: Game,
        meta: {
            authorize: true
        }
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

//router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'oidcStore'));
router.beforeEach((to, from, next) => {
    const { authorize } = to.meta;
    const currentUser = auth.getAccount();

    if (authorize) {
        if (!currentUser) {
            dialogService.toastError('You are not authorized');
            
            return next({ path: '/login' });
        }
    }

    /*
    if (authorize) {
        if (!currentUser) {
            return next({ path: '/' });
        }

        if (authorize.length) {
            let roleFound = false;

            if (currentUser.role) {
                for (let i = 0; i < authorize.length; i++) {
                    let requiredRole = authorize[i];
                    if (currentUser.role.includes(requiredRole)) {
                        roleFound = true;
                    }

                }
            }

            if (!roleFound) {
                return next({ path: '/' });
            }
        }
    }
    */

    return next();
});

export default router;
