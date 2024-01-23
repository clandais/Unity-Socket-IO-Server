import {SocketIOUser} from "../dto";

export class InviteRequest {
    public From: SocketIOUser;
    public To: SocketIOUser;

    constructor(from: SocketIOUser, to: SocketIOUser) {
        this.From = from;
        this.To = to;
    }
}