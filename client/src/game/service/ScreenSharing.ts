import { sanitizeUserIdForScreenSharing } from "../../lib/utils";
import {
    addScreenStream,
    setMyScreenStream,
    stopScreenSharing,
} from "../../app/features/webRtc/screenSlice";
import store from "../../app/store";
import Peer from "peerjs";

class ScreenSharing {
    private static instance: ScreenSharing;
    private peer: Peer | null = null;
    private initializationPromise: Promise<Peer> | null = null;
    myScreenStream: MediaStream;

    private constructor() {}

    public static getInstance(): ScreenSharing {
        if (!ScreenSharing.instance) {
            ScreenSharing.instance = new ScreenSharing();
        }
        return ScreenSharing.instance;
    }

    public getPeer(): Peer | null {
        return this.peer;
    }

    public async initializePeer(userId: string): Promise<Peer> {
        // If already initializing, return the existing promise
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // If already initialized, return the peer
        if (this.peer) {
            return Promise.resolve(this.peer);
        }

        // Create a new initialization promise
        this.initializationPromise = new Promise((resolve, reject) => {
            const sanitizedId = sanitizeUserIdForScreenSharing(userId);
            const peer = new Peer(sanitizedId);

            peer.on("open", (id) => {
                this.peer = peer;

                resolve(peer);
            });

            peer.on("call", (call) => {
                call.answer();
                call.on("stream", (userStream) => {
                    store.dispatch(
                        addScreenStream({ peerId: call.peer, call, userStream })
                    );
                });
            });

            peer.on("error", (error) => {
                console.error("Peer error:", error);
                reject(error);
            });
        });

        return this.initializationPromise;
    }

    public shareScreen(sessionId: string) {
        if (!this.peer) {
            console.error("Cannot call peer - Peer not initialized");
            throw new Error("Peer not initialized");
        }

        const myScreenStream = store.getState().screen.myScreenStream;
        if (!myScreenStream) {
            return;
        }

        try {
            const userId = sanitizeUserIdForScreenSharing(sessionId);
            this.peer.call(userId, myScreenStream);
        } catch (err) {
            console.error("Error while sharing screen: ", err);
            throw err;
        }
    }

    async getUserMedia() {
        const stream = await navigator.mediaDevices.getDisplayMedia();
        store.dispatch(setMyScreenStream(stream));

        const [track] = stream.getTracks();

        // this is callled when player uses browser provided "stop screen sharing" button.
        track.onended = () => {
            store.dispatch(stopScreenSharing());
        };
    }
}

export default ScreenSharing.getInstance();
