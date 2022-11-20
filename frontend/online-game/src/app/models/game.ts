import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

export interface IGameSerialized {
    name: string;
    currentPlayer: string;
    players: string[];
    maxPlayers: number;
    winner: string;
  }

export abstract class Game {

    private _name: string;
    private _currentPlayer: string;
    private _players: string[];
    private _maxPlayers: number;  // in case a room has more people inside, than people that can participate in a game
    private _winner: string;
    private _dataService: DataService
    
    constructor(name: string, maxPlayers: number, dataService?: DataService) {
        this._name = name
        this._maxPlayers = maxPlayers
        if (dataService != null) {
            this._dataService = dataService
        }
    }

    get name(): string {
        return this._name
    }

    get currentPlayer(): string {
        return this._currentPlayer
    }

    set currentPlayer(player: string) {
        this._currentPlayer = player
    }

    get maxPlayers(): number {
        return this._maxPlayers
    }

    get players(): string[] {
        return this._players
    }

    set players(players: string[])  {
        this._players = players
    }

    get winner(): string {
        return this._winner
    }

    set winner(player: string) {
        this._winner = player
    }

    setGameInDataService(game: Game) {
        if (this._dataService != null) {
            this._dataService.updateGameObject(game)
        }
    }

    fromJSON(gameString: string) {
        return JSON.parse(gameString)
    }

    public abstract isValidMove(field: number): boolean
    public abstract updateGameBoard(game: string): void
    public abstract serializeGame(): string

}