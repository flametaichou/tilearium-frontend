import { User, UserManager, UserManagerSettings } from 'oidc-client-ts';
import { dialogService } from './dialog.service';
import getEnv from '@/utils/env';

// Do not fill the VUE_APP_AUTH_CLIENT_SECRET
// It was added only for testing with Google
// Google doesn't work without it, see:
// - https://github.com/authts/oidc-client-ts/issues/152
// - https://github.com/authts/oidc-client-ts/issues/571
const settings: UserManagerSettings = {
    authority: getEnv('VUE_APP_AUTH_SERVER_URL'),
    client_id: getEnv('VUE_APP_AUTH_CLIENT_ID'),
    client_secret: getEnv('VUE_APP_AUTH_CLIENT_SECRET'),
    redirect_uri: window.location.origin + '/auth',
    //popup_redirect_uri: window.location.origin + '/auth',
    //silent_redirect_uri: window.location.origin + '/silent-renew',
    post_logout_redirect_uri: window.location.origin + '/auth',
    response_type: 'code',
    scope: 'openid profile email',
    accessTokenExpiringNotificationTimeInSeconds: Number.parseInt(getEnv('VUE_APP_AUTH_RENEW_TIME')) || 30,
    silentRequestTimeoutInSeconds: 10000,
    automaticSilentRenew: true,
    monitorSession: true
};

/*
const ACCOUNT_KEY = 'account';

function loadAccount(): User {
    if (localStorage.hasOwnProperty(ACCOUNT_KEY)) {
        try { 
            return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
        } catch (e) {
            console.error('Error on parsing stored user data: ' + e);
        }
    }

    return null;
}
*/

class AuthService {

    userManager = new UserManager(settings);
    user: User | null = null;

    constructor() {
        this.userManager.events.addUserSignedIn(() => {
            console.log('[Auth] Signed In');
        });

        this.userManager.events.addUserSessionChanged(() => {
            console.log('[Auth] Session changed');
        });

        this.userManager.events.addAccessTokenExpiring(async () => {
            console.log('[Auth] Token is expiring');

            const user = await this.userManager.getUser();

            if (user) {
                this.setAccount(user);
            }
        });

        this.userManager.events.addAccessTokenExpired(() => {
            console.log('[Auth] Token is expired');
        });

        this.userManager.events.addSilentRenewError((e) => {
            console.error('[Auth] Silent renew error: ', e);
        });

        // Loading user from the store
        this.userManager.getUser().then((u) => {
            if (u) {
                if (u.expired) {
                    console.log('[Auth] User expired');
                    dialogService.toast('Silent renew...');

                    this.userManager.signinSilent().then(
                        (u) => {
                            if (u) {
                                dialogService.toast('Silent renew success');
                                this.setAccount(u);

                            } else {
                                dialogService.toastError('You need to log in');
                                this.logOut();
                            }
                        },
                        (error) => {
                            dialogService.toastError('You need to log in ' + error);
                            this.logOut();
                        }
                    );
                } else {
                    console.log('[Auth] User loaded from storage');
                    this.setAccount(u);
                }
            } else {
                console.log('[Auth] User is not logged in');
            }
        });
    }
    
    getAccount(): User {
        return this.user;
    }

    setAccount(account: User) {
        this.user = account;

        /*
        if (account) {
            localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
        } else {
            localStorage.removeItem(ACCOUNT_KEY);
        }
        */

        const event = new CustomEvent<object>('tilearium:user', {
            detail : {
                user: this.user
            }
        });
        
        document.dispatchEvent(event);
    }

    logIn(): void {
        this.userManager.signinRedirect().then(() => {
        });
    }

    /*
    mockUser(): void {
        const user: User = {
            id_token: 'token',
            profile: {
                name: 'Test User'
            }
        } as User;

        this.setAccount(user);
    }
    */

    logOut(): void {
        this.userManager.signoutRedirect({
            id_token_hint: this.user.id_token
        });

        this.setAccount(null);
    }

    processCallback(): Promise<void> {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const isCallback = urlSearchParams.has('state');
        //const isCallbackError = urlSearchParams.has('error');

        if (isCallback) {
            return this.userManager.signinRedirectCallback()
                .then((user) => {
                    this.setAccount(user);
                })
                .catch((e) => {
                    dialogService.toastError(e);
                });
        }

        return new Promise((resolve) => {
            resolve();
        });
    }
}

export const auth = new AuthService();