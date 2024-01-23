import {AbstractHandler} from "./AbstractHandler";
import {SocketReservedEvents, SocketRoomEventsIn, SocketRoomEventsOut} from "../../constants";
import {Room} from "../dto";
import {RoomDatabase} from "../db/RoomDatabase";
import logger from "../../Logger";
import UserDatabase from "../db/UserDatabase";

export class IORoomHandler extends AbstractHandler {

    protected handle() {
        this.socket.on(SocketRoomEventsIn.ROOM_CREATE, (room: Room) => this.createRoom(room))
        this.socket.on(SocketRoomEventsIn.ROOM_JOIN, (room: Room) => this.joinRoom(room))
        this.socket.on(SocketRoomEventsIn.ROOM_GET_ALL, (fn: Function) => this.getAllRooms(fn))
        this.socket.on(SocketRoomEventsIn.ROOM_LEAVE , (room: Room) => this.leaveRoom(room))
    }

    private createRoom(room: Room) {

        let success = RoomDatabase.getInstance().addRoom(room);
        if (!success) {
            this.socket.emit(SocketRoomEventsOut.CREATE_ROOM_FAILED, "Room already exists");
            this.socket.emit(SocketReservedEvents.ERROR, "Room already exists");
            logger.error({message: `Room already exists. Name: ${room.Name}`});
            return;
        }


        let rooms = RoomDatabase.getInstance().getAllRooms();

        this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_CREATED, room);
        this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, rooms);

        this.joinRoom(room);

    }

    private joinRoom(room: Room) {

        // Check if the room has reached max players
        let reqRoom = RoomDatabase.getInstance().getRoom(room.Name);
        if (reqRoom.PlayerCount >= reqRoom.MaxPlayers) {
            this.socket.emit(SocketReservedEvents.ERROR, "Room is full");
            return;
        }

        // Check if user is already in the room
        let user = UserDatabase.getInstance().getUser(this.socket.id);
        if (reqRoom.Name === user.RoomId) {
            this.socket.emit(SocketReservedEvents.ERROR, "You are already in this room");
            return;
        }

        // try to join the room on the database
        if (!RoomDatabase.getInstance().joinRoom(reqRoom.Name, user)) {
            this.socket.emit(SocketReservedEvents.ERROR, "Failed to join room");
            return;
        }

        // join the room on the socket
        this.socket.join(reqRoom.Name);

        logger.info({
            eventName: `[JoinRoom]`,
            message: `User ${this.socket.id} joined room ${reqRoom.Name}`,
        });


        // emit the event to master and the room
        this.io.to("master")
            .to(reqRoom.Name)
            .emit(SocketRoomEventsOut.ON_ROOM_NEW_USER_JOINED, {Room: reqRoom, User: user});

        // emit the event to the user
        this.socket.emit(SocketRoomEventsOut.ON_ROOM_JOINED_BY_CURRENT_USER,  reqRoom);
    }


    private leaveRoom(room: Room) {

        let reqRoom = RoomDatabase.getInstance().getRoom(room.Name);
        let user = UserDatabase.getInstance().getUser(this.socket.id);
        let leftRoom = RoomDatabase.getInstance().leaveRoom(user);

        if (!leftRoom) {
            this.socket.emit(SocketReservedEvents.ERROR, "Failed to leave room");
            return;
        }

        this.socket.leave(reqRoom.Name);

        logger.info({
            eventName: `[LeaveRoom]`,
            message: `User ${this.socket.id} left room ${reqRoom.Name}`,
        });

        this.io.to(reqRoom.Name)
            .emit(SocketRoomEventsOut.ON_ROOM_LEFT_BY_OTHER_USER, {Room: reqRoom, User: user});

        this.socket.emit(SocketRoomEventsOut.ON_ROOM_LEFT_BY_CURRENT_USER, reqRoom);


    }
    private getAllRooms(fn: Function) {
        fn(RoomDatabase.getInstance().getAllRooms());
    }
}