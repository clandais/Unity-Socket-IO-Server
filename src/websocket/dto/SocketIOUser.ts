export class SocketIOUser {
    public ChatId: string;
    public Username: string;
    public PhotonId: string;
    public Color: string;
    public RoomId: string;

    constructor(chatId: string, username: string, photonId?: string, color?: string, roomId?: string) {
        this.ChatId = chatId;
        this.Username = username;
        this.PhotonId = photonId;
        this.Color = color;
        this.RoomId = roomId;
    }

    toString(): string {
        return `Username: ${this.Username} PhotonId : (${this.PhotonId}) - ChatId: ${this.ChatId} - Color: ${this.Color}`;
    }
}

