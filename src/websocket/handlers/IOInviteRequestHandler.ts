import {Server, Socket} from "socket.io";
import {InviteRequest} from "../dto";

/**
 *  Unused for now
 */
export class IOInviteRequestHandler {
    constructor(io: Server, socket: Socket) {
        socket.on('invite-request', (data: InviteRequest) => {
            socket.broadcast.emit('invite-request', data);
        });
    }
}