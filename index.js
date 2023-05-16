const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const axios = require('axios')
const mongoose = require('mongoose')

const Model = require('./models/model.js')

mongoose.connect('mongodb+srv://Chatinho:Wawdst7!@chatinho.0rkobbh.mongodb.net/?retryWrites=true&w=majority')
//mongoose.connect('mongodb://127.0.0.1:27017')
const db = mongoose.connection

db.on('error', (error) => {
    console.log(error)
})

db.once('connected', () => {
    console.log('Conectado ao banco de dados!')
})

const port = process.env.PORT || 3000
let connectedUsers = []
let messages = []

async function getMessages() {
    messages = await Model.find()
    await console.log('Mensagens carregadas!')
    io.emit('message', { type: 'serverUpdate' })
    messages.push({ type: 'serverUpdate' })
    io.emit('messagesUpdate', messages)
    console.log(messages)
}

getMessages()

function getDate() {
    let date = new Date()
    date.setHours(date.getHours() - 4)
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${hour}:${minute}:${second}`
}

io.on('connection', async (socket) => {
    let user
    io.emit('messagesUpdate', messages)
    socket.on('clientConnection', async (data) => {
        user = { name: data.user }
        const dataToSave = new Model({
            user: user.name,
            text: 'nada',
            type: 'joined',
            date: getDate()
        })
        await dataToSave.save()
        console.log(`joinLog added! ${dataToSave}`)
        messages.push(dataToSave)
        io.emit('messagesUpdate', messages)
        connectedUsers.push(user)
        console.log(`${user.name} entrou!`)
        console.log(connectedUsers)
        io.emit('usersUpdate', connectedUsers)
    })
    socket.on('message', async (data) => {
        io.emit('msgSound', {name: user.name})
        const dict = { user: user.name, text: data.text, type: 'msg', date: getDate() }
        const dataToSave = new Model(dict)
        console.log(`Msg added! ${dataToSave}`)
        await dataToSave.save()
        console.log(dataToSave)
        messages.push(dataToSave)
        io.emit('messagesUpdate', messages)
        console.log(messages)
    })
    socket.on('disconnect', async () => {
        connectedUsers = connectedUsers.filter(item => item.name !== user.name)
        console.log(connectedUsers)
        const dict = { user: user.name, text: 'nada', type: 'left', date: getDate() }
        const dataToSave = new Model(dict)
        console.log(`Msg added! ${dataToSave}`)
        await dataToSave.save()
        console.log(dataToSave)
        messages.push(dataToSave)
        io.emit('messagesUpdate', messages)
        io.emit('usersUpdate', connectedUsers)
    })
})

function keepAlive() {
    axios.get('https://chatinhoserver.onrender.com').then((response) => {
        console.log(response.data)
    }).catch((error) => {
        console.log(error.message)
    })
}

app.get('/', (req, res) => {
    res.send('Estou vivo!')
})

server.listen(port, () => {
    console.log(`Servidor iniciado na porta: ${port}`)
    setInterval(keepAlive, 60000)
})