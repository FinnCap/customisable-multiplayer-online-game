// import { User } from "./user";

// export class RoomMessage {
//     type: RoomType;
//     user: User;
//     roomId: string;
//     error: RoomError;

//     constructor(type: RoomType, user: User, roomId: string = "", error: RoomError = RoomError.NONE) {
//         this.type = type;
//         this.user = user;
//         this.roomId = roomId;
//         this.error = error;
//     }
// }

// export enum RoomType {
//     NEWROOM,
//     WAIT,
//     JOIN,
//     LEAVE
// }

// export enum RoomError {
//     NONE,
//     NOTEXIST,
//     NOTPERMITTED,
//     FULL
// }