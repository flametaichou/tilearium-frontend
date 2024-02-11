import SockJS from 'sockjs-client';
import Stomp, { Client } from 'webstomp-client';

const debugMode = false;
const reconnectDelay = 3000;

class WebSocketService {

    weakWebsockets: typeof SockJS[] = [];
    weakStompClients: Client[] = [];
    stompClient: Client = null;

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

            const headers = {};

            this.stompClient.connect(
                headers,
                (frame) => {
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

                    return setTimeout(() => {

                        return this.init();

                    }, reconnectDelay);
                }
            );
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(path: string, callbackFunction: (arg: any) => void, weak: boolean) {
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

export const $WebSocketService = new WebSocketService();
