import { Toast } from '@/classes/toast';
import store from '@/store';

class DialogService {

    toastError(msg: string) {
        console.error(msg);

        const toast = new Toast();

        toast.type = 'error';
        toast.message = msg;

        store.dispatch('addToast', toast);
    }

    toast(msg: string) {
        console.log(msg);

        const toast = new Toast();
        
        toast.type = 'info';
        toast.message = msg;

        store.dispatch('addToast', toast);
    }
}

export const dialogService = new DialogService();