const express = require("express");
require("dotenv").config();
const path = require("path");
const http = require("http");
const Filter = require("bad-words");
const { Server } = require("socket.io");
const { generateMsg } = require("../src/utils/msg.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  socket.on("join:room", ({ username, room }) => {
    socket.join(room);
    socket.emit("recieve:msg", generateMsg("Welcome!"));
    socket.broadcast
      .to(room)
      .emit("recieve:msg", generateMsg(`${username} joined`));
  });
  socket.on("send:msg", (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb("profanity is not allowed!");
    }
    io.emit("recieve:msg", generateMsg(msg));
    cb();
  });
  socket.on("disconnect", () => {
    io.emit("user:left");
  });
  socket.on("send:location", (location) => {
    socket.emit(
      "receive:location",
      generateMsg(
        `https://maps.google.com?q=${location.latitude},${location.longitude}`
      )
    );
  });
});

server.listen(port, () => {
  console.log("server listening at", port);
});
