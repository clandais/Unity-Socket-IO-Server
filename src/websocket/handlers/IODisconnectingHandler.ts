import logger from "../../Logger";
import {SocketConnectionEvents, SocketReservedEvents} from "../../constants";
import {AbstractHandler} from "./AbstractHandler";

export class IODisconnectingHandler extends AbstractHandler {
    handle(): void {

        this.socket.on(SocketReservedEvents.DISCONNECTING, (reason) => {

            logger.info({
                eventName: SocketReservedEvents.DISCONNECTING,
                socketId: this.socket.id,
                reason: reason
            });

            this.socket.emit(SocketConnectionEvents.PLAYER_DISCONNECTING, "bye");
        });
    }
}