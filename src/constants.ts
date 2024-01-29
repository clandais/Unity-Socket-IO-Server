export enum SocketReservedEvents {
    CONNECTION = 'connection',
    CONNECT_ERROR = 'connect_error',
    DISCONNECT = 'disconnect',
    DISCONNECTING = 'disconnecting',
    // do not use this event
    NEW_LISTENER = 'newListener',
    // do not use this event
    REMOVE_LISTENER = 'removeListener',
    ERROR = 'error',
}


export enum SocketConnectionEvents {
    CONNECTION = 'connection',
    ON_NEW_USER_CONNECTED_TO_MASTER = 'on-new-user-connected-to-master',
    PLAYER_DISCONNECTING = 'player-disconnecting',
}


export enum SocketRoomEventsIn {
    ROOM_JOIN_RANDOM = 'room-join-random',
    ROOM_CREATE = 'room-create',
    ROOM_JOIN = 'room-join',
    ROOM_LEAVE = 'room-leave',
    ROOM_GET_ALL = 'room-get-all',
}

export enum SocketRoomEventsOut {
    CREATE_ROOM_FAILED = 'create-room-failed',
    ON_ROOM_CREATED = 'on-room-created',
    ON_ROOM_LIST_UPDATED = 'on-room-list-updated',
    ON_ROOM_NEW_USER_JOINED = 'on-user-joined-room',
    ON_ROOM_JOINED_BY_CURRENT_USER = 'on-room-creation-success',
    ON_ROOM_LEFT_BY_CURRENT_USER = 'on-room-left',
    ON_ROOM_LEFT_BY_OTHER_USER = 'on-room-left-by-other-user',
}

export enum SocketCustomEvents {

    ON_USER_UPDATED = 'on-user-updated',
}

export enum SocketUserEventsOut {
    USER_UPDATED = 'user-updated'
}

export enum SocketUserEventsIn {
    GET_USER = 'get-user',
    GET_ALL_USERS = 'get-all-users',
    USER_UPDATE = 'update-user',
}

export enum SocketChatEventsIn {
    SEND_GENERAL_MESSAGE = 'c1f86ec78d964489a9cdc5dc70b01442',
    SEND_ROOM_MESSAGE = '96ce1edfbad94ddf9e92fb11332e795a',
}

export enum SocketChatEventsOut {
    ON_GENERAL_MESSAGE_RECEIVED = 'dd287ab4bfba4aa3bbb4f4b5f6c0510d',
    ON_ROOM_MESSAGE_RECEIVED = '4a67710dcb7048c0aa90453619defdf9',
}