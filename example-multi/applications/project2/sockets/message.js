export default {
  connect (socket) {
    socket.send('send message via socket.io')
  },
  disconnect () {},
  disconnecting () {},
  error () {}
}