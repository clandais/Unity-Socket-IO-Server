import express from "express";
import cors from "cors";
import * as http from "http";
import dotenv from "dotenv";
import * as SocketIO from "socket.io";

import {SocketIOUser} from "./websocket/dto";
import UserDataBase from "./websocket/db/UserDatabase";
import {
    IOChatMessageHandler,
    IOConnectionHandler,
    IODisconnectingHandler,
    IOGetUserHandler,
    IOInviteRequestHandler,
    IORoomHandler,
    IOUserHandler
} from "./websocket/handlers";
import {instrument} from "@socket.io/admin-ui";
import logger from "./Logger";
import {SocketReservedEvents, SocketRoomEventsOut} from "./constants";
import {RoomDatabase} from "./websocket/db/RoomDatabase";
import UserDatabase from "./websocket/db/UserDatabase";

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

        this.io.use((socket, next) => {
                if (socket.handshake.query.token === process.env.APP_TOKEN) {
                    let userExists = UserDataBase.getInstance().userExists(socket.handshake.query.username as string);
                    if (userExists) {
                        return next(new Error("user already exist"));
                    }
                    let user: SocketIOUser = new SocketIOUser(socket.id, socket.handshake.query.username as string);
                    UserDataBase.getInstance().addUser(user);
                    return next();
                } else {
                    return next(new Error("invalid token " + socket.handshake.auth.token));
                }

            });


        this.io.on(SocketReservedEvents.CONNECTION, (socket: SocketIO.Socket) => {


            logger.info("A Client with id " + socket.id + " connected");

            socket.join("master");


            this.registerHandlers(socket);


            socket.on(SocketReservedEvents.DISCONNECT, () => {
                logger.info({
                    eventName: `[Disconnect]`,
                    socketId: socket.id
                });

                let user = UserDataBase.getInstance().getUser(socket.id);
                let room = RoomDatabase.getInstance().leaveRoom(user);

                if (!UserDatabase.getInstance().removeUser(socket.id)) {
                    logger.error({
                        eventName: `[Disconnect]`,
                        message: `Failed to remove user ${socket.id} from database`
                    });
                }

                if (room != null && room.Players.length <= 0) {
                    RoomDatabase.getInstance().removeRoom(room.Name);
                    this.io.to("master").emit(SocketRoomEventsOut.ON_ROOM_LIST_UPDATED, room.Name);
                }

                logger.info({
                    eventName: `[Disconnect]`,
                    message: `User ${socket.id} disconnected`
                });

            });


        }).on(SocketReservedEvents.ERROR, (err) => {
            console.error(err);
        });


        this.io.on(SocketReservedEvents.CONNECT_ERROR, (err) => {
            logger.error(err);
        });


        this.io.listen(this.server);
        logger.info("Socket.io server listening on port " + this.port);

    }

    private registerHandlers(socket: SocketIO.Socket): void {

        this.handlers.push(new IOConnectionHandler(this.io, socket));
        this.handlers.push(new IODisconnectingHandler(this.io, socket));
        this.handlers.push(new IOChatMessageHandler(this.io, socket));
        this.handlers.push(new IOGetUserHandler(this.io, socket));
        this.handlers.push(new IOInviteRequestHandler(this.io, socket));
        this.handlers.push(new IORoomHandler(this.io, socket));
        this.handlers.push(new IOUserHandler(this.io, socket));

    }

    public getApp(): express.Application {
        return this.app;
    }

}