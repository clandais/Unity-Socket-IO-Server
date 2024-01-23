import {SocketIOUser} from "../dto";

export class Room {
    public Name: string;
    public MaxPlayers: number;
    public PlayerCount: number;
    public Players: SocketIOUser[];

    constructor(name: string, maxPlayers: number, playerCount: number, players: SocketIOUser[]) {
        this.Name = name;
        this.MaxPlayers = maxPlayers;
        this.PlayerCount = playerCount;
        this.Players = players || [];
    }
}