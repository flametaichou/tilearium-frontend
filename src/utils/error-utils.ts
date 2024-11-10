import { AxiosError } from 'axios';

export function getErrorMessage(errorResponse: AxiosError): string {
    let errorMessage = '';

    if (errorResponse) {
        if (errorResponse.response && errorResponse.response.data) {
            if ((errorResponse.response.data as { message: string }).message) {
                errorMessage = (errorResponse.response.data as { message: string }).message;
            }
        }

        if (!errorMessage) {
            errorMessage = errorResponse.message;
        }

        //errorMessage = convertErrorMessage(errorMessage);
    }

    return errorMessage;
}