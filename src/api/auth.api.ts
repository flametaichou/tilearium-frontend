import { http } from '@/http/http';

class AuthApi {

    check() {
        return http.get('auth/check');
    }
}
export const authApi = new AuthApi();