import {SocketIOUser} from "../dto";
import UserDatabase from "../db/UserDatabase";
import {AbstractHandler} from "./AbstractHandler";
import {SocketCustomEvents} from "../../constants";

export class IOUserHandler extends AbstractHandler {

    protected handle() {
        this.socket.on(SocketCustomEvents.UPDATE_USER, (data: SocketIOUser) => {
            let user = UserDatabase.getInstance().updateUser(data);
            this.socket.emit(SocketCustomEvents.ON_USER_UPDATED, user);
        });
    }
}