import axios, { AxiosError, AxiosResponse } from 'axios';
import store from '@/store';
import router from '@/router';
import { User } from 'oidc-client-ts';
import { dialogService } from '@/service/dialog.service';
import { getErrorMessage } from '@/utils/error-utils';

const instance = axios.create({
    baseURL: process.env.VUE_APP_API_URL
});

instance.interceptors.request.use(
    (req) => {
        const user: User = store.state.account;

        if (user) {
            console.log(user);
            const accessToken = user.id_token;

            req.headers['Authorization'] = `Bearer ${accessToken}`;
        }
    
        return req;
    },
    (err) => {
        return Promise.reject(err);
    }
);

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (!error.config) {
            dialogService.toastError('Error in request');

        } else if (!error.response) {
            dialogService.toastError('The server is not responding');

        } else {
            const code = error.response ? error.response.status : 503;

            switch (code) {
                case 401:
                    dialogService.toastError('Unauthorized error: ' + getErrorMessage(error));
                    store.dispatch('authorize', undefined);
                    router.push('/');
                    break;
                case 403:
                    dialogService.toastError('You do not have permission to do this');
                    break;

            }
        }

        return Promise.reject(error);
    }
);

export const http = instance;
