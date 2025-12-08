class SocketManager {
  constructor() {
    this.socket = null;
  }

  connect(userName) {
    this.socket = new WebSocket("ws://localhost:8080");

    this.socket.onopen = () => {
      this.socket.send("@+" + userName);
    };

    return this.socket;
  }
}

export default new SocketManager();
