const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { v4: uuidv4 } = require("uuid");

app.use(express.static("public"));

let rooms = {};

io.on("connection", socket => {

    socket.on("joinRoom", roomId => {

        if (!rooms[roomId])
            rooms[roomId] = { players: [] };

        if (rooms[roomId].players.length >= 2)
            return socket.emit("roomFull");

        socket.join(roomId);
        rooms[roomId].players.push(socket.id);

        let role =
            rooms[roomId].players.length === 1
                ? "hare"
                : "tortoise";

        socket.emit("role", role);

        socket.on("move", data => {
            socket.to(roomId).emit("opponentMove", data);
        });

        socket.on("disconnect", () => {
            delete rooms[roomId];
        });
    });
});

http.listen(3000, () =>
    console.log("Server running on 3000")
);
