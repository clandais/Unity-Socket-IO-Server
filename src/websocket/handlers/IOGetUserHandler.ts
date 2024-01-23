import UserDataBase from "../db/UserDatabase";
import {AbstractHandler} from "./AbstractHandler";
import {SocketCustomEvents} from "../../constants";

export class IOGetUserHandler extends AbstractHandler {
    handle() {
        this.socket.on(SocketCustomEvents.GET_USER, (data: string, fn: Function) => {
            fn(UserDataBase.getInstance().getUser(data))
        });
    }
}