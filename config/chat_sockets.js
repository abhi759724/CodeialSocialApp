// const ChatMessage = require('../models/chatBox');

module.exports.chatSockets = function (socketServer) {
  let io = require("socket.io")(socketServer);

  // 2..
  io.sockets.on("connection", function (socket) {
    console.log("new connection received", socket.id);

    socket.on("disconnect", function () {
      console.log("socket disconnected!");
    });

    socket.on("join_room", function (data) {
      console.log("joining request rec.", data);

      socket.join(data.chatroom);

      io.in(data.chatroom).emit("user_joined", data);
    });

    socket.on("send_message", function (data) {
      io.in(data.chatroom).emit("receive_message", data);
      console.log("send_message:: ", data);
      // const msg = new ChatMessage({
      //     sender: data.sender,
      //     receiver: data.receiver,
      //     message: data.message

      // });

      // msg.save().then(() => {
      //     io.in(data.chatroom).emit('receive_message',{
      //         sender: data.sender,
      //         receiver: data.receiver,
      //         message: data.message
      //     });

      // });
    });
  });
};
