import {AbstractHandler} from "./AbstractHandler";
import {SocketUserEventsIn, SocketUserEventsOut} from "../../constants";
import {UserDataBase} from "../db";
import {SocketIOUser} from "../dto";

export class IOUserHandler extends AbstractHandler {
    handle() {
        this.socket.on(SocketUserEventsIn.GET_USER, (data: string, fn: Function) => this.getUser(data, fn));
        this.socket.on(SocketUserEventsIn.GET_ALL_USERS, (fn: Function) => this.getAllUsers(fn));
        this.socket.on(SocketUserEventsIn.USER_UPDATE, (data: SocketIOUser) => this.updateUser(data));
    }

    private getUser(data: string, fn: Function) {
        fn(UserDataBase.getInstance().getUser(data))
    }

    private getAllUsers(fn: Function) {

        fn(UserDataBase.getInstance().getAllUsers());
    }

    private updateUser(data: SocketIOUser) {
        let user = UserDataBase.getInstance().updateUser(data);
        this.socket.emit(SocketUserEventsOut.USER_UPDATED, user);
    }
}