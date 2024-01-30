import {SocketConnectionEvents} from "../../constants";
import {AbstractHandler} from "./AbstractHandler";
import logger from "../../Logger";
import {UserDataBase} from "../db";


/**
 *  Handle the connection event
 */
export class IOConnectionHandler extends AbstractHandler {
    protected handle() {

        this.socket.emit(SocketConnectionEvents.CONNECTION,
            {
                Date: new Date().getTime(),
                ChatId: this.socket.id
            });

        logger.info({
            eventName: `[Connection]`,
            socketId: this.socket.id
        });

        // let the other users know that a new user has connected
        let user = UserDataBase.getInstance().getUser(this.socket.id);
        this.io.to("master").except(this.socket.id)
            .emit(SocketConnectionEvents.ON_NEW_USER_CONNECTED_TO_MASTER, user);
    }
}