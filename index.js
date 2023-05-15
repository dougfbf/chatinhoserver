const { kStringMaxLength } = require('buffer')
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

const port = process.env.PORT || 3000
let connectedUsers = []
let messages = []

io.on('connection', (socket) => {
    let user
    io.emit('messagesUpdate', messages)
    socket.on('clientConnection', (data) => {
        user = {name: data.user}
        connectedUsers.push(user)
        console.log(`${user.name} entrou!`)
        console.log(connectedUsers)
        io.emit('usersUpdate', connectedUsers)
    })
    socket.on('message', (data) => {
        messages.push(data)
        io.emit('messagesUpdate', messages)
    })
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(item => item.name !== user.name)
        console.log(`${user.name} saiu!`)
        console.log(connectedUsers)
        io.emit('usersUpdate', connectedUsers)
    })
})

app.get('/', (req, res) => {
    res.send('sai daq curioso')
})

server.listen(port, () => {
    console.log(`Servidor iniciado na porta: ${port}`)
})