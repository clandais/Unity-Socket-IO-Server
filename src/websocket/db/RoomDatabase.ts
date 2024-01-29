import {Room, SocketIOUser} from "../dto";
import logger from "../../Logger";

export class RoomDatabase {

    private static instance: RoomDatabase;
    private db = new Map<string, Room>();

    public static getInstance(): RoomDatabase {
        if (!RoomDatabase.instance) {
            RoomDatabase.instance = new RoomDatabase();
        }
        return RoomDatabase.instance;
    }

    public addRoom(room: Room): boolean {
        if (this.db.has(room.Name)) {
            return false;
        }

        logger.info({
            debug: `adding room ${room.Name}`,
        });

        this.db.set(room.Name, room);
        return true;
    }

    public removeRoom(name: string): boolean {

        if (!this.db.has(name)) return false;

        logger.info({
            debug: `removing room ${name}`,
        });

        return this.db.delete(name);
    }

    public getRoom(name: string): Room {
        return this.db.get(name);
    }

    public joinRoom(name: string, user: SocketIOUser): boolean {

        if (!this.db.has(name)) return false;

        logger.info({
            debug: `adding user ${user.Username} to room ${name}`,
        });

        let room = this.db.get(name);
        room.Players.push(user);
        room.PlayerCount++;
        user.RoomId = room.Name;

        return true;
    }

    public leaveRoom(user: SocketIOUser): Room {
        if (!this.db.has(user.RoomId)) {
            logger.info({
                debug: `room ${user.RoomId} does not exist`,
            });
            return null;
        }

        logger.info({
            debug: `removing user ${user.Username} from room ${user.RoomId}`,
        });

        let room = this.db.get(user.RoomId);
        room.Players = room.Players.filter((u) => {
            return u.ChatId !== user.ChatId;
        });
        room.PlayerCount--;
        user.RoomId = null;

        if (room.Players.length <= 0) {
            this.removeRoom(room.Name);
        }

        return room;
    }

    /**
     * Returns all rooms in the database
     */
    public getAllRooms(): Room[] {

        let rooms: Room[] = [];

        for (let room of this.db.values()) {
            rooms.push(room);
        }

        return rooms;
    }

    public getUsersInRoom(name: string): SocketIOUser[] {
        if (!this.db.has(name)) return [];

        let room = this.db.get(name);

        return room.Players;
    }

    public isUserInRoom(user: SocketIOUser): boolean {
        for (let room of this.db.values()) {
            if (room.Players.find((u) => {
                return u.ChatId === user.ChatId;
            }) !== undefined) {
                return true;
            }
        }
        return false;
    }
}