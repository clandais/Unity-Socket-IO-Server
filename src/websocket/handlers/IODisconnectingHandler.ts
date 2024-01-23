import UserDataBase from "../db/UserDatabase";
import UserDatabase from "../db/UserDatabase";
import logger from "../../Logger";
import {
    SocketConnectionEvents,
    SocketCustomEvents,
    SocketReservedEvents,
    SocketRoomEventsIn,
    SocketRoomEventsOut
} from "../../constants";
import {AbstractHandler} from "./AbstractHandler";
import {RoomDatabase} from "../db/RoomDatabase";

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