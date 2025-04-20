import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/TheHome.vue';
import Game from '../views/TheGame.vue';
import Main from '../views/TheMain.vue';
import { useStore } from 'vuex';
import TheLogin from '@/views/TheLogin.vue';
import TheCallback from '@/views/TheCallback.vue';
import TheCallbackError from '@/views/TheCallbackError.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Main',
        component: Main,
        meta: {
            authorize: false
        },
        children: [
            {
                path: '/worlds',
                name: 'Worlds',
                component: Home
            },
            {
                path: '/',
                name: 'About',
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "about" */ '../views/TheAbout.vue')
            },
            {
                path: '/auth',
                name: 'AuthCallback',
                component: TheCallback,
                meta: {
                    authorize: false
                }
            },
            {
                path: '/auth-error',
                name: 'AuthCallbackError',
                component: TheCallbackError,
                meta: {
                    authorize: false
                }
            }
        ]
    },
    /*
    {
        path: '/login',
        name: 'Login',
        component: TheLogin,
        meta: {
            authorize: false
        }
    },
    */
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
    const store = useStore();
    const currentUser = store.state.account;

    if (authorize) {
        if (!currentUser) {
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
