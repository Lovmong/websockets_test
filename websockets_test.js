const IS_PING_PONG_ENABLED = false;
const PING_PONG_TIMEOUT = 2000;
const PING_PONG_SEND_INTERVAL = 500;
let socket;
var isActiveDisconnect = false; // 是否主动断开

const ipAddress = document.getElementById("ipAddress");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const binaryInput = document.getElementById("binaryArray");
const sendBinaryBtn = document.getElementById("sendBinaryBtn");

if (!"WebSocket" in window) {
  alert("WebSocket is not supported by your browser!");
}

const storedIPValue = localStorage.getItem("ipAddress");
if (storedIPValue) {
  ipAddress.value = storedIPValue;
}

// Helper function to get current timestamp
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString(); // Format: HH:MM:SS
}

// Helper function to add a message to the messages div
function addMessage(content, type) {
  const timestamp = getTimestamp();
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", type);
  messageElement.innerHTML = `
          <span class="timestamp">[${timestamp}]</span> ${content}
      `;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
}

connectBtn.addEventListener("click", () => {
  const url = ipAddress.value;
  localStorage.setItem("ipAddress", url);
  if (!url) {
    alert("Please enter a valid WebSocket server address.");
    return;
  }

  socket = new WebSocket(url);
  socket.binaryType = "arraybuffer";

  socket.onopen = () => {
    addMessage("Connected to server.", "info");

    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    sendBtn.disabled = false;
    isActiveDisconnect = false;
    sendBinaryBtn.disabled = false;
    if (IS_PING_PONG_ENABLED) {
      socket.send("ping"); // Send a ping message to the server
      addMessage(`Sent: ping`, "sent");
      ping_interval = setInterval(() => {
        if (socket.readyState == 1) {
          socket.send("ping");
          addMessage(`Sent: ping`, "sent");
        }
      }, PING_PONG_SEND_INTERVAL);
    }
  };

  socket.onmessage = (message) => {
    let recv_msg = message.data;
    let msg_type = typeof recv_msg;

    // -- string data --
    if (msg_type == "string") {
      addMessage(`Received string: ${recv_msg}`, "received");
    }
    // -- binary data protocol --
    else if (msg_type == "object") {
      // note: need to set socket.binaryType = "arraybuffer";
      let data_bytes = new Uint8Array(recv_msg);
      let str = "";
      // console.log(data_bytes.length);
      for (let i = 0; i < data_bytes.length; i++) {
        if (data_bytes[i] < 0x10) {
          str += " 0x0" + data_bytes[i].toString(16);
        } else {
          str += " 0x" + data_bytes[i].toString(16);
        }
      }
      addMessage(`Received binary: ${str}`, "received");
    }
  };

  socket.onclose = () => {
    if (isActiveDisconnect) {
      addMessage("Active Disconnection closed.", "info");
    } else {
      addMessage("Disconnected from server.", "info");
    }
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    sendBtn.disabled = true;
    sendBinaryBtn.disabled = true;
  };

  socket.onerror = (error) => {
    addMessage(`Error: ${error.message}`, "error");
  };
});

disconnectBtn.addEventListener("click", () => {
  if (socket) {
    isActiveDisconnect = true;
    socket.close(3001, "非正常关闭");
  }
});

sendBtn.addEventListener("click", () => {
  const message = messageInput.value;
  if (message && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    addMessage(`Sent: ${message}`, "sent");
    //   messageInput.value = "";
  }
});

sendBinaryBtn.addEventListener("click", () => {
  const hexString = binaryInput.value;
  const hexArray = hexString.split(",");
  const binaryData = new Uint8Array(
    hexArray.map((hex) => parseInt(hex.replace("0x", "").trim(), 16))
  );
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(binaryData);
    addMessage(`Sent: ${hexString}`, "sent");
  }
});
