import { Room, Client } from "colyseus";
import { MyRoomState, Player, OfficeChat } from "../rooms/schema/MyRoomState";

type officeNames =
    | "mainOffice"
    | "eastOffice"
    | "westOffice"
    | "northOffice1"
    | "northOffice2";   

export class MyRoom extends Room<MyRoomState> {
    room: string;
    roomPassword: string;
    hasPassword = false;

    // for debugging purpose only
    getAllMessages() {
        const allMessages: {
            username: string;
            message: string;
        }[] = [];
        this.state.mainOfficeChat.forEach((msg) => {
            allMessages.push({
                username: msg.username,
                message: msg.message,
            });
        });
        console.log("All Messages: ", allMessages);
        console.log("----------------------------");
    }

    /** Helper method to get the appropriate state properties for each office */
    private getOfficeData(officeName: officeNames) {
        const officeMap = {
            mainOffice: {
                members: this.state.mainOfficeMembers,
                chat: this.state.mainOfficeChat,
                name: "main office",
            },
            eastOffice: {
                members: this.state.eastOfficeMembers,
                chat: this.state.eastOfficeChat,
                name: "east office",
            },
            westOffice: {
                members: this.state.westOfficeMembers,
                chat: this.state.westOfficeChat,
                name: "west office",
            },
            northOffice1: {
                members: this.state.northOffice1Members,
                chat: this.state.northOffice1Chat,
                name: "north 1 office",
            },
            northOffice2: {
                members: this.state.northOffice2Members,
                chat: this.state.northOffice2Chat,
                name: "north 2 office",
            },
        };

        return officeMap[officeName];
    }

    /** Helper method to get user's office type, used when user leaves the game */
    private getUserOfficeName(sessionId: string): officeNames {
        if (this.state.mainOfficeMembers.has(sessionId)) {
            return "mainOffice";
        } else if (this.state.eastOfficeMembers.has(sessionId)) {
            return "eastOffice";
        } else if (this.state.westOfficeMembers.has(sessionId)) {
            return "westOffice";
        } else if (this.state.northOffice1Members.has(sessionId)) {
            return "northOffice1";
        } else if (this.state.northOffice2Members.has(sessionId)) {
            return "northOffice2";
        }

        return null;
    }

    private handleOfficeJoin(
        client: Client,
        username: string,
        officeName: officeNames
    ) {
        const sessionId = client.sessionId;
        const { chat, members, name } = this.getOfficeData(officeName);

        const message = `Just joined ${name} lobby`;
        const messageType = "PLAYER_JOINED";
        const newMessage = new OfficeChat();
        newMessage.username = username;
        newMessage.message = message;
        newMessage.type = messageType;

        // Add user to the appropriate office members collection
        members.set(sessionId, username);

        // Add message to the appropriate chat collection
        chat.push(newMessage);

        client.send("GET_OFFICE_CHAT", chat);

        // Notify other players when current player enters office.
        members.forEach((_, userId) => {
            if (userId === client.sessionId) return;

            this.clients.getById(userId).send("USER_JOINED_OFFICE", {
                playerSessionId: client.sessionId,
                username,
                message,
                type: messageType,
            });
        });
    }

    private handleOfficeLeave(
        client: Client,
        username: string,
        officeName: officeNames
    ) {
        const sessionId = client.sessionId;
        const { name, chat, members } = this.getOfficeData(officeName);
        // if condition is required when user haven't given his webcam permission yet, otherwise servers gives this error:
        // @colyseus/schema MapSchema: trying to delete non-existing index: vd04glYYb (undefined)
        // TODO: don't know why this is happening, need to investigate it!!!!
        if (members.has(sessionId)) {
            const message = `Left ${name} lobby`;
            const messageType = "PLAYER_LEFT";
            const newMessage = new OfficeChat();
            newMessage.username = username;
            newMessage.message = message;
            newMessage.type = messageType;

            chat.push(newMessage);

            members.delete(sessionId);

            // Notify other players when current player leaves office.
            members.forEach((_, userId) => {
                this.clients.getById(userId).send("PLAYER_LEFT_OFFICE", {
                    playerSessionId: client.sessionId,
                    username,
                    message,
                    type: messageType,
                });
            });
        }
    }

    onAuth(
        client: Client,
        options: { roomName: string; password: string | null }
    ) {
        if (!this.roomPassword) return true;

        if (this.roomPassword === options.password) {
            return true;
        }
        return false;
    }

    onCreate(options: { name: string; password: string | null }) {
        this.room = options.name;
        this.roomPassword = options.password;
        if (options.password) this.hasPassword = true;
        this.setMetadata({ name: options.name, hasPassword: this.hasPassword });

        this.setState(new MyRoomState());

        this.onMessage("UPDATE_PLAYER", (client, input) => {
            const player = this.state.players.get(client.sessionId);
            player.x = input.playerX;
            player.y = input.playerY;
            player.anim = input.anim;

            const status = input.status;

            if (!status) return;

            if (status.isMicOn !== undefined) {
                player.isMicOn = status.isMicOn;
            }

            if (status.isWebcamOn !== undefined) {
                player.isWebcamOn = status.isWebcamOn;
            }

            if (status.isDisconnected !== undefined) {
                player.isDisconnected = status.isDisconnected;
            }
        });

        this.onMessage("JOIN_OFFICE", (client, { username, office }) => {
            this.handleOfficeJoin(client, username, office);
        });

        this.onMessage("LEAVE_OFFICE", (client, { username, office }) => {
            this.handleOfficeLeave(client, username, office);
        });

        this.onMessage(
            "PUSH_OFFICE_MESSAGE",
            (client, { username, message, officeName }) => {
                const { members, chat } = this.getOfficeData(officeName);
                const type = "REGULAR_MESSAGE";
                const newMessage = new OfficeChat();
                newMessage.username = username;
                newMessage.message = message;
                newMessage.type = type;

                chat.push(newMessage);

                members.forEach((_, userId) => {
                    this.clients.getById(userId).send("NEW_OFFICE_MESSAGE", {
                        username,
                        message,
                        type,
                    });
                });
            }
        );

        this.onMessage(
            "PUSH_GLOBAL_CHAT_MESSAGE",
            (client, { username, message }) => {
                const type = "REGULAR_MESSAGE";

                const newMessage = new OfficeChat();
                newMessage.username = username;
                newMessage.message = message;
                newMessage.type = type;

                this.state.globalChat.push(newMessage);
                this.broadcast("NEW_GLOBAL_CHAT_MESSAGE", {
                    username,
                    message,
                    type,
                });
            }
        );

        this.onMessage(
            "USER_STOPPED_SCREEN_SHARING",
            (client, officeName: officeNames) => {
                const { members } = this.getOfficeData(officeName);
                members.forEach((username, userId) => {
                    // preventing sending message to ourself
                    if (userId === client.sessionId) return;

                    this.clients
                        .getById(userId)
                        .send("USER_STOPPED_SCREEN_SHARING", client.sessionId);
                });
            }
        );

        this.onMessage(
            "USER_STOPPED_OFFICE_WEBCAM",
            (client, officeName: officeNames) => {
                const { members } = this.getOfficeData(officeName);
                members.forEach((username, userId) => {
                    // preventing sending message to ourself
                    if (userId === client.sessionId) return;

                    this.clients
                        .getById(userId)
                        .send("END_VIDEO_CALL_WITH_USER", client.sessionId);
                });
            }
        );

        this.onMessage(
            "USER_STOPPED_PROXIMITY_WEBCAM",
            (client, proximityPlayers) => {
                proximityPlayers.forEach((player: string) => {
                    this.clients
                        .getById(player)
                        .send("END_VIDEO_CALL_WITH_USER", client.sessionId);
                });
            }
        );

        this.onMessage(
            "CONNECT_TO_OFFICE_VIDEO_CALL",
            (client, officeName: officeNames) => {
                const { members } = this.getOfficeData(officeName);
                members.forEach((username, userId) => {
                    if (userId === client.sessionId) return;

                    this.clients
                        .getById(userId)
                        .send("CONNECT_TO_VIDEO_CALL", client.sessionId);
                });
            }
        );

        this.onMessage(
            "CONNECT_TO_PROXIMITY_VIDEO_CALL",
            (client, proximityPlayers) => {
                proximityPlayers.forEach((player: string) => {
                    this.clients
                        .getById(player)
                        .send("CONNECT_TO_VIDEO_CALL", client.sessionId);
                });
            }
        );

        this.onMessage(
            "REMOVE_FROM_PROXIMITY_CALL",
            (client, proximityPlayerSessionId) => {
                this.clients
                    .getById(proximityPlayerSessionId)
                    .send("END_VIDEO_CALL_WITH_USER", client.sessionId);
            }
        );
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        console.log("options: ", options);

        const player = new Player();

        player.x = 550;
        player.y = 150;
        player.username = options.username;
        player.anim = `${options.character}_down_idle`;
        player.isMicOn = options.isMicOn;
        player.isWebcamOn = options.isWebcamOn;
        player.isDisconnected = false;

        this.state.players.set(client.sessionId, player);

        const username = options.username;
        const message = "Just joined the lobby!";
        const type = "PLAYER_JOINED";

        const newMessage = new OfficeChat();
        newMessage.username = username;
        newMessage.message = message;
        newMessage.type = type;
        this.state.globalChat.push(newMessage);

        // notifying all users expect the newly joined user that a new user has joined
        this.broadcast(
            "NEW_GLOBAL_CHAT_MESSAGE",
            { username, message, type },
            {
                except: [client],
            }
        );

        // sending whole chat to the newly joined user
        client.send("GET_GLOBAL_CHAT", this.state.globalChat);
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");

        const username = this.state.players.get(client.sessionId).username;

        const type = "PLAYER_LEFT";
        const message = `Left the lobby!`;

        const newMessage = new OfficeChat();
        newMessage.type = type;
        newMessage.username = username;
        newMessage.message = message;

        this.state.players.delete(client.sessionId);
        this.state.globalChat.push(newMessage);
        this.broadcast("NEW_GLOBAL_CHAT_MESSAGE", {
            username,
            message,
            type,
        });

        const officeName = this.getUserOfficeName(client.sessionId);

        if (officeName) {
            this.handleOfficeLeave(client, username, officeName);
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
