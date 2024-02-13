const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  socket.emit("message", "welcome");
  socket.on("send:msg", (msg) => {
    io.emit("recieve:msg", msg);
  });
});

server.listen(port, () => {
  console.log("server listening at", port);
});
