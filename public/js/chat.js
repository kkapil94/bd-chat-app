const socket = io();
const msgForm = document.querySelector(".msgForm");
const msgInput = document.querySelector(".msgInput");

socket.on("recieve:msg", (msg) => {
  console.log(msg);
});

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("send:msg", msgInput.value);
});
