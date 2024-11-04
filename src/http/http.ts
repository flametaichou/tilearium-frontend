import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.VUE_APP_API_URL
});

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.config) {
            // По идее сюда мы не должны заходить никогда. Что делать? Только разлогинить.
            //store.dispatch('systemMessages/addError', 'Ошибка в запросе');

        } else if (!error.response || error.response.status === 401 || error.response.data.status === 401) {
            // !error.response - это не правильно, но вернуть корректный код при невалидном токене не получилось

            //store.dispatch('systemMessages/addMessage', 'Обновление токена...');

        } else if (error.response.status === 403 || error.response.data.status === 403) {
            // Нормальная ошибка, говорящая что недостаточно прав
            //store.dispatch('systemMessages/addError', 'У вас недостаточно прав для выполнения этой операции');
        }

        return Promise.reject(error);
    }
);

export const $http = instance;
