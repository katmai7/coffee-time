const {app, BrowserWindow, ipcMain} = require("electron");
const notifier = require("node-notifier");
const path = require("path");

const multicast_addr = "255.255.255.255";
const port = 9747;

const udp = require("dgram");
const ifaces = require("os").networkInterfaces();

const addresses = Object.keys(ifaces).reduce(function (result, dev) {
  return result.concat(ifaces[dev].reduce(function (result, details) {
    return result.concat(details.family === "IPv4" && !details.internal ? [details.address] : []);
  }, []));
});

const listener = udp.createSocket({ type: "udp4", reuseAddr: true }),
      sender = udp.createSocket({ type: "udp4", reuseAddr: true });

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 250,
    height: 70,
    icon: __dirname + '/coffee.ico',
    resizable: false
  });

  win.loadURL(`file://${__dirname}/index.html`);
  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  };
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  };
});

sender.bind(() => sender.setBroadcast(true));

listener.on("listening", () => listener.setBroadcast(true));

listener.on("message", function(message, connection) {
  if(addresses.indexOf(connection.address) == -1) {
    notifier.notify({
      title: "Hey!",
      message: message,
      icon: path.join(__dirname, "coffee.ico")
    });
  };
});

listener.bind(port);

ipcMain.on("send-message", function(event, name) {
  if(name == "") name = "Someone";
  let data = new Buffer(`${name} is going to have a coffee break!`);
  sender.send(data, 0, data.length, port, multicast_addr);
});
