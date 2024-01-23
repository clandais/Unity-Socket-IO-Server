import {SocketIOUser} from "../dto";

export class ChatMessage {
    public Sender: SocketIOUser;
    public Message: string;

    constructor(sender: SocketIOUser, message: string) {
        this.Sender = sender;
        this.Message = message;
    }

    toString(): string {
        return `${this.Sender.Username}: ${this.Message}`;
    }
}