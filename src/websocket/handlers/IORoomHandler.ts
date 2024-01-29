import {AbstractHandler} from "./AbstractHandler";
import {SocketReservedEvents, SocketRoomEventsIn, SocketRoomEventsOut} from "../../constants";
import {Room} from "../dto";
import logger from "../../Logger";
import {RoomDatabase, UserDataBase} from "../db";

export class IORoomHandler extends AbstractHandler {
    get MAX_USERS_PER_ROOM(): number {
        return 4;
    }


    protected handle() {
        this.socket.on(SocketRoomEventsIn.ROOM_JOIN_RANDOM, () => this.joinRandomRoom())
        this.socket.on(SocketRoomEventsIn.ROOM_CREATE, (room: Room) => this.createRoom(room))
        this.socket.on(SocketRoomEventsIn.ROOM_JOIN, (room: Room) => this.joinRoom(room))
        this.socket.on(SocketRoomEventsIn.ROOM_GET_ALL, (fn: Function) => this.getAllRooms(fn))
        this.socket.on(SocketRoomEventsIn.ROOM_LEAVE, (room: Room) => this.leaveRoom(room))
    }

    private createRoom(room: Room) {


        if (room.MaxPlayers > this.MAX_USERS_PER_ROOM) {
            this.socket.emit(SocketRoomEventsOut.CREATE_ROOM_FAILED, "Max players exceeded");
            logger.error({
                from: "IORoomHandler.createRoom",
                message: `Max players exceeded. Name: ${room.Name}`
            });
            return;
        }

        let success = RoomDatabase.getInstance().addRoom(room);
        if (!success) {
            this.socket.emit(SocketRoomEventsOut.CREATE_ROOM_FAILED, "Room already exists");
            this.socket.emit(SocketReservedEvents.ERROR, "Room already exists");
            logger.error({
                from: "IORoomHandler.createRoom",
                message: `Room already exists. Name: ${room.Name}`
            });
            return;
        }


        let rooms = RoomDatabase.getInstance().getAllRooms();

        this.socket.to("master").emit(SocketRoomEventsOut.ON_ROOM_CREATED, room);
        this.socket.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, rooms);

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
        let user = UserDataBase.getInstance().getUser(this.socket.id);
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
            from: "IORoomHandler.joinRoom",
            eventName: `[JoinRoom]`,
            message: `User ${this.socket.id} joined room ${reqRoom.Name}`,
        });


        this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, RoomDatabase.getInstance().getAllRooms());

        // emit the event to master and the room
        this.io
            .to(reqRoom.Name)
            .emit(SocketRoomEventsOut.ON_ROOM_NEW_USER_JOINED, {Room: reqRoom, User: user});

        // emit the event to the user
        this.socket.emit(SocketRoomEventsOut.ON_ROOM_JOINED_BY_CURRENT_USER, reqRoom);
    }


    private leaveRoom(room: Room) {
        let user = UserDataBase.getInstance().getUser(this.socket.id);
        let leftRoom = RoomDatabase.getInstance().leaveRoom(user);

        if (!leftRoom) {
            this.socket.emit(SocketReservedEvents.ERROR, "Failed to leave room");
            return;
        }

        this.socket.leave(leftRoom.Name);

        logger.info({
                from: "IORoomHandler.leaveRoom",
                eventName: `[LeaveRoom]`,
                message: `User ${this.socket.id} left room ${leftRoom.Name}`,
            }
        );

        this.io.to(leftRoom.Name)
            .emit(SocketRoomEventsOut.ON_ROOM_LEFT_BY_OTHER_USER, {Room: leftRoom, User: user});
        this.socket.emit(SocketRoomEventsOut.ON_ROOM_LEFT_BY_CURRENT_USER, leftRoom);
        this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, RoomDatabase.getInstance().getAllRooms());

    }

    private getAllRooms(fn: Function) {
        fn(RoomDatabase.getInstance().getAllRooms());
    }

    private joinRandomRoom() {
        let rooms = RoomDatabase.getInstance().getAllRooms();
        let room = rooms.find((room) => room.PlayerCount < room.MaxPlayers);
        if (!room) {
            room = new Room(
                "socket_" + this.socket.id,
                this.MAX_USERS_PER_ROOM,
                0,
                [],
            );
            this.createRoom(room);
        } else {
            this.joinRoom(room);
        }
    }
}