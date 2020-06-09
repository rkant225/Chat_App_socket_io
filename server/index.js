const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const router = require('./Router');
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server); //socket instance
const {addUser,removeUser,getUser,getUsersInRoom} = require('./users')
 
io.on('connection', (socket)=>{
    console.log('A new user joined...!!!,');
    // JOIN Event handler
    socket.on('join', (data, callback)=>{
        const result = addUser({id : socket.id, name : data.name, room : data.room});

        if(result.error){
            return callback(result.error); // call with error, and check IF ELSE condition in CLient Application.
        }
        // Admin will send message to newly joined user and all other users in room.
        socket.emit('message', {user : 'admin', text : `${result.name}, welcome to chat room : ${result.room}`}); // only of the newly joined user.
        socket.broadcast.to(result.room).emit('message', {user : 'admin', text : `${result.name} has joined the chat.`}); // for all other users in room.
        socket.join(result.room)

        io.to(result.room).emit('roomData', {room : result.room, users : getUsersInRoom(result.room)})
        
        callback(); // call without error
    });

    // new message from users handler
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user : user.name, text : message});
            callback();
        }
        
    });


    // DISCONNECT handler
    socket.on('disconnect', ()=>{
        console.log('A user Disconnected...!!!');

        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user : 'admin', text : `${user.name} left the chat room.`});
            io.to(user.room).emit('roomData', {room : user.room, users : getUsersInRoom(user.room)})

        }
    })
})

app.use(router);
app.use(cors());


server.listen(PORT, ()=>console.log(`Server started listening at port : ${PORT}`));