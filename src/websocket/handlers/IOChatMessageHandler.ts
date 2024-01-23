import {ChatMessage} from "../dto";
import {AbstractHandler} from "./AbstractHandler";
import {SocketCustomEvents} from "../../constants";

export class IOChatMessageHandler extends AbstractHandler {
    protected handle() {
        this.socket.on(SocketCustomEvents.CHAT_MESSAGE, (msg: ChatMessage, fn: Function) => {
            fn(msg);
            this.io.emit(SocketCustomEvents.CHAT_MESSAGE, msg);
        });

    }
}