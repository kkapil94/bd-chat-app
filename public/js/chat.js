const socket = io();

//elements
const msgForm = document.querySelector(".msgForm");
const msgInput = document.querySelector(".msgInput");
const msgFormButton = document.querySelector(".msgFormButton");
const sendLocationBtn = document.querySelector(".sendLocationBtn");
const msgs = document.querySelector("#msgs");

//temps
const msgTemp = document.querySelector("#msg-temp").innerHTML;
const locTemp = document.querySelector("#loc-temp").innerHTML;
const sideTemp = document.querySelector("#side-temp").innerHTML;

//queries from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//user join event
socket.on("user:joined", (user) => {
  console.log("user has joined");
});

//receive msg from users
socket.on("recieve:msg", (msg) => {
  const html = Mustache.render(msgTemp, {
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    username: msg.username,
  });
  msgs.insertAdjacentHTML("beforeend", html);
});

//user goes offline
socket.on("user:left", () => {
  console.log("the user has left");
});

//get location of hte ser
socket.on("receive:location", (msg) => {
  const html = Mustache.render(locTemp, {
    location: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    username: msg.username,
  });
  msgs.insertAdjacentHTML("beforeend", html);
  console.log(location);
});

//room join
socket.emit("join:room", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
  console.log("joined room successfully");
});

//room data
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideTemp, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

//sends message
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  msgFormButton.setAttribute("disabled", "disabled");
  socket.emit("send:msg", msgInput.value, (error) => {
    msgFormButton.removeAttribute("disabled");
    msgInput.value = "";
    msgInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("msg sent successfully!");
  });
});

//gets location from browser api
sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("geo-location is not supported by your browser");
  }
  sendLocationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    sendLocationBtn.removeAttribute("disabled");
    const { longitude, latitude } = position.coords;
    socket.emit("send:location", { longitude, latitude });
  });
});
