export class SocketIOUser {
    public ChatId: string;
    public Username: string;
    public OtherIds: string[];
    public Color: string;
    public RoomId: string;

    constructor(chatId: string, username: string, otherIds?: string[], color?: string, roomId?: string) {
        this.ChatId = chatId;
        this.Username = username;
        this.OtherIds = otherIds;
        this.Color = color;
        this.RoomId = roomId;
    }
}

