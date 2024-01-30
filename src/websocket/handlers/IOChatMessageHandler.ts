import {ChatMessage} from "../dto";
import {AbstractHandler} from "./AbstractHandler";
import {SocketChatEventsIn, SocketChatEventsOut} from "../../constants";
import logger from "../../Logger";

/**
 * Handle the chat message events
 */
export class IOChatMessageHandler extends AbstractHandler {
    protected handle() {
        this.socket.on(SocketChatEventsIn.SEND_GENERAL_MESSAGE, (msg: ChatMessage, fn: Function) => this.sendGeneralMessage(msg, fn));
        this.socket.on(SocketChatEventsIn.SEND_ROOM_MESSAGE, (msg: ChatMessage, fn: Function) => this.sendRoomMessage(msg, fn));
    }

    /**
     * Send a general message to all users
     * @param msg
     * @param fn
     * @private
     */
    private sendGeneralMessage(msg: ChatMessage, fn: Function) {

        logger.info({
            from: "IOChatMessageHandler.sendGeneralMessage",
            message: JSON.stringify(msg)
        });

        this.io.emit(SocketChatEventsOut.ON_GENERAL_MESSAGE_RECEIVED, msg);

        fn(msg);
    }

    /**
     * Send a message to all users in a room
     * @param msg
     * @param fn
     * @private
     */
    private sendRoomMessage(msg: ChatMessage, fn: Function) {

        logger.info({
            from: "IOChatMessageHandler.sendRoomMessage",
            message: JSON.stringify(msg)
        });

        this.io.to(msg.Sender.RoomId).emit(SocketChatEventsOut.ON_ROOM_MESSAGE_RECEIVED, msg);
        fn(msg);
    }
}