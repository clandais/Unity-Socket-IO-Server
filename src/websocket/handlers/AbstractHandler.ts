import {Server, Socket} from "socket.io";

export abstract class AbstractHandler {

    protected io: Server;
    protected socket: Socket;

    constructor(io: Server, socket: Socket) {
        this.io = io;
        this.socket = socket;
        this.handle();
    }

    protected abstract handle(): void;
}