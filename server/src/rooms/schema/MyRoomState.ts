import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";


export class Player extends Schema {
    @type("number") x: number;
    @type("number") y: number;
    @type("string") username: string;
    @type("string") anim: string;
    @type("boolean") isMicOn: boolean = false;
    @type("boolean") isWebcamOn: boolean = false;
    @type("boolean") isDisconnected: boolean = false;
}

type MessageType = "PLAYER_JOINED" | "PLAYER_LEFT" | "REGULAR_MESSAGE";

export class OfficeChat extends Schema {
    @type("string") username: string;
    @type("string") message: string;
    @type("string") type: MessageType;
}

export class MyRoomState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();

    @type([OfficeChat]) globalChat = new ArraySchema<OfficeChat>(); // storing global chat messages

    // storing members' sessionId and username as key-value pair
    // this is required to fetch member's username for screen sharing purposes.
    @type({ map: "string" }) mainOfficeMembers = new MapSchema<string>();
    @type([OfficeChat]) mainOfficeChat = new ArraySchema<OfficeChat>(); // storing main office's chat messages

    @type({ map: "string" }) eastOfficeMembers = new MapSchema<string>();
    @type([OfficeChat]) eastOfficeChat = new ArraySchema<OfficeChat>();

    @type({ map: "string" }) northOffice1Members = new MapSchema<string>();
    @type([OfficeChat]) northOffice1Chat = new ArraySchema<OfficeChat>();

    @type({ map: "string" }) northOffice2Members = new MapSchema<string>();
    @type([OfficeChat]) northOffice2Chat = new ArraySchema<OfficeChat>();

    @type({ map: "string" }) westOfficeMembers = new MapSchema<string>();
    @type([OfficeChat]) westOfficeChat = new ArraySchema<OfficeChat>();
}

// {
//   "players": {
//     "sessionId1": {
//       "x": 100,
//       "y": 200,
//       "username": "Alice",
//       "anim": "idle",
//       "isMicOn": true,
//       "isWebcamOn": false,
//       "isDisconnected": false
//     },
//     "sessionId2": {
//       "x": 150,
//       "y": 250,
//       "username": "Bob",
//       "anim": "walk",
//       "isMicOn": false,
//       "isWebcamOn": true,
//       "isDisconnected": false
//     }
//   },
//   "globalChat": [
//     {
//       "username": "Alice",
//       "message": "Hello everyone!",
//       "type": "REGULAR_MESSAGE"
//     }
//   ],
//   "mainOfficeMembers": {
//     "sessionId1": "Alice"
//   },
//   "mainOfficeChat": [
//     {
//       "username": "Alice",
//       "message": "Welcome to the main office.",
//       "type": "PLAYER_JOINED"
//     }
//   ],
//   "eastOfficeMembers": {},
//   "eastOfficeChat": [],
//   "northOffice1Members": {},
//   "northOffice1Chat": [],
//   "northOffice2Members": {},
//   "northOffice2Chat": [],
//   "westOfficeMembers": {
//     "sessionId2": "Bob"
//   },
//   "westOfficeChat": [
//     {
//       "username": "Bob",
//       "message": "I'm in the west office.",
//       "type": "REGULAR_MESSAGE"
//     }
//   ]
// }