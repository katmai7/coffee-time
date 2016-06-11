"using strict";
const {ipcRenderer} = require("electron");

document.getElementById("coffee_btn").onclick = function() {
  let name = document.getElementById("name").value;
  ipcRenderer.send("send-message", name);
};
