export class User {
    username: string;
    points: number;
    id: string;

    constructor(username: string) {
        this.username = username;
        this.points = 0;
    }

    addPoint() {
        this.points++;
    }
}