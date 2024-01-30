import {AbstractHandler} from "./AbstractHandler";
import {SocketUserEventsIn, SocketUserEventsOut} from "../../constants";
import {UserDataBase} from "../db";
import {SocketIOUser} from "../dto";

/**
 *  Handle user related events
 */
export class IOUserHandler extends AbstractHandler {
    handle() {
        this.socket.on(SocketUserEventsIn.GET_USER, (data: string, fn: Function) => this.getUser(data, fn));
        this.socket.on(SocketUserEventsIn.GET_ALL_USERS, (fn: Function) => this.getAllUsers(fn));
        this.socket.on(SocketUserEventsIn.USER_UPDATE, (data: SocketIOUser) => this.updateUser(data));
    }

    /**
     *  Get a user by its id
     * @param data
     * @param fn
     * @private
     */
    private getUser(data: string, fn: Function) {
        fn(UserDataBase.getInstance().getUser(data))
    }

    /**
     * Get all the users in the database
     * @param fn
     * @private
     */
    private getAllUsers(fn: Function) {

        fn(UserDataBase.getInstance().getAllUsers());
    }

    /**
     * Update a user and send the updated user to the client
     * @param data
     * @private
     */
    private updateUser(data: SocketIOUser) {
        let user = UserDataBase.getInstance().updateUser(data);
        this.socket.emit(SocketUserEventsOut.USER_UPDATED, user);
    }
}