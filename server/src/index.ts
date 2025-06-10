import http from "http";
import express from "express";
import cors from "cors";
import { Server, LobbyRoom } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { MyRoom } from "./rooms/MyRoom";

// import socialRoutes from "@colyseus/social/express"
// //fix.2 // fix.3-//finaltest

const port = Number(process.env.PORT || 2567);
const host = process.env.HOST || "0.0.0.0"; // Bind to all interfaces
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
    server,
});

// register room handlers
gameServer.define("LOBBY_ROOM", LobbyRoom);
gameServer.define("PUBLIC_ROOM", MyRoom);
gameServer.define("PRIVATE_ROOM", MyRoom).enableRealtimeListing();
//
/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// Add health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        port: port,
        host: host 
    });
});

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port, host);
console.log(`Listening on ws://${host}:${port}`);
