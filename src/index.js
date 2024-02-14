const express = require("express");
require("dotenv").config();
const path = require("path");
const http = require("http");
const Filter = require("bad-words");
const { Server } = require("socket.io");
const { generateMsg } = require("./utils/msg.js");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  socket.on("join:room", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return cb(error);
    }
    socket.join(room);
    socket.emit("recieve:msg", generateMsg("Welcome!", "admin"));
    socket.broadcast
      .to(room)
      .emit("recieve:msg", generateMsg(`${username} joined`, username));
    io.to(room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(room),
    });
    cb();
  });
  socket.on("send:msg", (msg, cb) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb("profanity is not allowed!");
    }
    io.to(user.room).emit("recieve:msg", generateMsg(msg, user.username));
    cb();
  });
  socket.on("disconnect", () => {
    io.emit("user:left");
  });
  socket.on("send:location", (location) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "receive:location",
      generateMsg(
        `https://maps.google.com?q=${location.latitude},${location.longitude}`,
        user.username
      )
    );
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "recieve:msg",
        generateMsg(`${user.username} has left`)
      );
    }
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

server.listen(port, () => {
  console.log("server listening at", port);
});
