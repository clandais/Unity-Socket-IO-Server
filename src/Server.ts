import express from "express";
import cors from "cors";
import * as http from "http";
import dotenv from "dotenv";
import * as SocketIO from "socket.io";

import {SocketIOUser} from "./websocket/dto";
import {RoomDatabase, UserDataBase} from "./websocket/db";
import {
    IOChatMessageHandler,
    IOConnectionHandler,
    IODisconnectingHandler,
    IORoomHandler,
    IOUserHandler
} from "./websocket/handlers";
import {instrument} from "@socket.io/admin-ui";
import logger from "./Logger";
import {SocketReservedEvents, SocketRoomEventsOut, SocketUserEventsOut} from "./constants";

/**
 * The server, main class of the application
 */
export class Server {

    public static readonly PORT: number = 8080;
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private port: string | number;
    private handlers: Array<any> = [];

    constructor() {

        dotenv.config();

        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();

    }

    public getApp(): express.Application {
        return this.app;
    }

    /**
     * Create the express application
     * @private
     */
    private createApp(): void {
        let corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200
        };

        this.app = express();
        this.app.use(cors(corsOptions));
    }

    /**
     * Configure application port
     * @private
     */
    private config(): void {
        this.port = process.env.APP_PORT || Server.PORT;
    }

    /**
     * Create the http server
     * @private
     */
    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    /**
     * Create the socket.io server
     * @private
     */
    private sockets(): void {

        this.io = new SocketIO.Server(this.server, {
            cors: {
                origin: "*",
            },
            pingInterval: 10000,
            pingTimeout: 5000,
        });

        instrument(this.io, {
            auth: false,
            mode: "development",
        });
    }

    /**
     * Listen to the server and set up the handlers
     * @private
     */
    private listen(): void {

        this.server = this.app.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        /**
         *  Register a middleware to:
         *   - check if the token is valid
         *   - check if the username is already taken
         *   - create a new user
         *   - emit the user to the client
         */
        this.io.use((socket, next) => {
            if (socket.handshake.query.token === process.env.APP_TOKEN) {
                let userExists = UserDataBase.getInstance().userExists(socket.handshake.query.username as string);
                if (userExists) {
                    return next(new Error("user already exist"));
                }
                let user: SocketIOUser = new SocketIOUser(socket.id, socket.handshake.query.username as string);

                if (user.Username === "" || user.Username === null || user.Username === undefined) {
                    logger.info({
                        eventName: `[Connection]`,
                        message: `User ${socket.id} has no username, attributing random username`
                    });

                    user.Username = "User_" + Math.floor(Math.random() * UserDataBase.getInstance().getCount() + 1);
                }
                UserDataBase.getInstance().addUser(user);

                socket.emit(SocketUserEventsOut.USER_UPDATED, user);

                logger.info({
                    eventName: `[${SocketUserEventsOut.USER_UPDATED}]`,
                    message: `User ${socket.id} ${user.Username} ${user.OtherIds} ${user.Color} ${user.RoomId}`
                });
                return next();
            } else {
                return next(new Error("invalid token " + socket.handshake.auth.token));
            }

        });

        this.handleConnection();
        this.handleErrors();

        this.io.listen(this.server);
        logger.info("Socket.io server listening on port " + this.port);

    }


    /**
     * Handle the connection of a new client
     * @private
     */
    private handleConnection(): void {
        this.io.on(SocketReservedEvents.CONNECTION, (socket: SocketIO.Socket) => {

            // register all the socket io events handlers
            this.registerHandlers(socket);
            logger.info("A Client with id " + socket.id + " connected");
            socket.join("master");

            // handle the disconnection of a client
            socket.on(SocketReservedEvents.DISCONNECT, () => {
                logger.info({
                    eventName: `[Disconnect]`,
                    socketId: socket.id
                });

                // try to remove the user from the database
                let user = UserDataBase.getInstance().getUser(socket.id);
                if (user === undefined) {
                    logger.error({
                        eventName: `[Disconnect]`,
                        message: `User ${socket.id} not found in database`
                    });
                    return;
                }

                if (!UserDataBase.getInstance().removeUser(socket.id)) {
                    logger.error({
                        eventName: `[Disconnect]`,
                        message: `Failed to remove user ${socket.id} from database`
                    });
                }


                // make the user leave the room (if he was in one)
                let room = RoomDatabase.getInstance().leaveRoom(user);
                if (room != null && room.Players.length <= 0) {
                    RoomDatabase.getInstance().removeRoom(room.Name);
                    this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, RoomDatabase.getInstance().getAllRooms());
                }

                logger.info({
                    eventName: `[Disconnect]`,
                    message: `User ${socket.id} disconnected`
                });

            });


        }).on(SocketReservedEvents.ERROR, (err) => {
            logger.error( err );
        });
    }

    /**
     * Handle the connections errors
     * @private
     */
    private handleErrors(): void {
        this.io.on(SocketReservedEvents.CONNECT_ERROR, (err) => {
            logger.error(err);
        });
    }

    /**
     * Register all the socket io events handlers
     * @param socket
     * @private
     */
    private registerHandlers(socket: SocketIO.Socket): void {

        this.handlers.push(new IOConnectionHandler(this.io, socket));
        this.handlers.push(new IODisconnectingHandler(this.io, socket));
        this.handlers.push(new IOChatMessageHandler(this.io, socket));
        this.handlers.push(new IOUserHandler(this.io, socket));
        this.handlers.push(new IORoomHandler(this.io, socket));
        this.handlers.push(new IOUserHandler(this.io, socket));

    }

}