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

function getDate() {
    let date = new Date()
    date.setHours(date.getHours())
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${hour}:${minute}:${second}`
}

io.on('connection', (socket) => {
    let user
    io.emit('messagesUpdate', messages)
    socket.on('clientConnection', (data) => {
        user = {name: data.user}
        messages.push('message', {user: user.name, type: 'joined', date: getDate()})
        io.emit('messagesUpdate', messages)
        connectedUsers.push(user)
        console.log(`${user.name} entrou!`)
        console.log(connectedUsers)
        io.emit('usersUpdate', connectedUsers)
    })
    socket.on('message', (data) => {
        console.log(data)
        messages.push(data)
        io.emit('messagesUpdate', messages)
        console.log(messages)
    })
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(item => item.name !== user.name)
        console.log(`${user.name} saiu!`)
        console.log(connectedUsers)
        messages.push('message', {user: user.name, type: 'left', date: getDate()})
        io.emit('messagesUpdate', messages)
        io.emit('usersUpdate', connectedUsers)
    })
})

function keepAlive() {
    console.log('Tô vivo carai')
    io.emit('nada')
}

app.get('/', (req, res) => {
    res.send('sai daq curioso')
})

server.listen(port, () => {
    console.log(`Servidor iniciado na porta: ${port}`)
    setInterval(keepAlive, 60000)
})