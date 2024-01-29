import {SocketIOUser} from "../dto/SocketIOUser";
import logger from "../../Logger";


export class UserDataBase {

    private static instance: UserDataBase;
    private db = new Map<string, SocketIOUser>();

    public static getInstance(): UserDataBase {
        if (!UserDataBase.instance) {
            UserDataBase.instance = new UserDataBase();
        }
        return UserDataBase.instance;
    }

    public getCount(): number {
        return this.db.size;
    }

    /**
     * Adds a user to the database
     * @param user : SocketIOUser
     */
    public addUser(user: SocketIOUser): void {

        logger.info({
            from: "UserDatabase.addUser(user: SocketIOUser): void",
            debug: `adding user ${JSON.stringify(user)}`,
        });

        this.db.set(user.ChatId, user);
    }

    /**
     * Removes a user from the database
     * @param chatId : string
     */
    public removeUser(chatId: string): boolean {

        logger.info({
            from: "UserDatabase.removeUser(chatId: string): void",
            debug: `removing user ${chatId}`,
        });
        return this.db.delete(chatId);
    }

    /**
     * Returns a user from the database based on the chatId
     * @param chatId : string
     * @returns SocketIOUser
     */
    public getUser(chatId: string): SocketIOUser {
        return this.db.get(chatId);
    }

    /**
     * returns if the user exists in the database
     * @param username : string
     */
    public userExists(username: string): boolean {

        let user = Array.from(this.db.values()).find((user) => {
            return user.Username === username;
        });

        return user !== undefined;
    }

    /**
     *  Updates the user in the database
     * @param data : SocketIOUser
     */
    public updateUser(data: SocketIOUser): SocketIOUser {

        logger.info({
            from: "UserDatabase.updateUser(data: SocketIOUser): SocketIOUser",
            debug: `updating user ${JSON.stringify(data)}`,
        });


        if (data.Username === undefined || data.Username === '') {
            // generate a new username
            data.Username = "user" + Math.floor(Math.random() * 1000);
        }

        this.db.set(data.ChatId, data);
        return data;
    }

    getAllUsers() {

        return Array.from(this.db.values());
    }
}