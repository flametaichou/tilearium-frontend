import SockJS from 'sockjs-client';
import store from '@/store';
import Stomp, { Client } from 'webstomp-client';
import { User } from 'oidc-client-ts';
import { dialogService } from './dialog.service';

const debugMode = false;
const reconnectDelay = 10000;

class WebSocketService {

    weakWebsockets: typeof SockJS[] = [];
    weakStompClients: Client[] = [];
    stompClient: Client = null;
    sessionId: string = null;

    init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const wsAddress: string = process.env.VUE_APP_API_URL.replace('/api', '') + 'ws';

            console.log(wsAddress);
            const socket: typeof SockJS = new SockJS(wsAddress);

            this.stompClient = Stomp.over(socket);

            /*
            if (weak) {
                this.weakWebsockets.push(socket);
                this.weakStompClients.push(this.stompClient);
            }
            */

            if (!debugMode) {
                this.stompClient.debug = () => {};
            }

            const user: User = store.state.account;
            const accessToken = user?.id_token;

            const headers = {
                'Authorization': accessToken ? 'Bearer ' + accessToken : ''
            };

            //StompHeaders connectHeaders = new StompHeaders();
            //connectHeaders.add("login", "test1");
            //connectHeaders.add("passcode", "test");
            //stompClient.connect(WS_HOST_PORT, new WebSocketHttpHeaders(), connectHeaders, new MySessionHandler());

            this.stompClient.connect(
                headers,
                (frame) => {

                    // FIXME: looks like a hack
                    const url = this.stompClient.ws._transport.url;
                    const parts = url.split('/');

                    this.sessionId = parts[parts.length - 2];
                    console.log('Your current session is: ' + this.sessionId);

                    if (debugMode) {
                        console.log('Connected: ' + frame);
                    }
                    resolve();
                },
                (frame) => {
                    if (debugMode) {
                        console.log('Disconnected', frame);
                        console.log('Reconnecting...');
                        console.log('Wait for' + reconnectDelay / 1000 + 'sec');
                    }

                    dialogService.toastError(`Can not establish connection with server. Retry in ${reconnectDelay / 1000} seconds...`);

                    return setTimeout(() => {

                        return this.init();

                    }, reconnectDelay);
                }
            );
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(path: string, callbackFunction: (arg: any) => void, weak: boolean) {
        path = path.replace(':sessionId', this.sessionId);
        
        this.stompClient.subscribe(path, (val) => {
            callbackFunction(JSON.parse(val.body));
        });
    }

    send(path: string, body: object): void {
        this.stompClient.send(path, JSON.stringify(body));
    }

    onRouteChange() {
        this.weakStompClients.forEach((client) => {
            client.disconnect();
        });

        this.weakWebsockets.forEach((socket) => {
            socket.close();
        });
    }
}

export const webSocketService = new WebSocketService();
