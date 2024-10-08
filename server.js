const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Simpan posisi pemain
const players = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Berikan warna acak dan posisi awal
    players[socket.id] = {
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 500),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    };

    // Kirim data pemain baru ke semua klien
    io.emit('updatePlayers', players);

    // Tangani pergerakan pemain
    socket.on('move', (direction) => {
        const player = players[socket.id];
        // Kurangi kecepatan menjadi 2 piksel per gerakan
        const speed = 1; 
        
        if (direction === 'up') player.y -= speed;
        if (direction === 'down') player.y += speed;
        if (direction === 'left') player.x -= speed;
        if (direction === 'right') player.x += speed;

        // Update posisi
        io.emit('updatePlayers', players);
    });

    // Tangani disconnect
    socket.on('disconnect', () => {
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Berikan warna acak dan posisi awal
            players[socket.id] = {
                x: Math.floor(Math.random() * 500),
                y: Math.floor(Math.random() * 500),
                color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            };

            // Kirim data pemain baru ke semua klien
            io.emit('updatePlayers', players);

            // Tangani pergerakan pemain
            socket.on('move', (direction) => {
                const player = players[socket.id];
                if (direction === 'up') player.y -= 10;
                if (direction === 'down') player.y += 10;
                if (direction === 'left') player.x -= 10;
                if (direction === 'right') player.x += 10;

                // Update posisi
                io.emit('updatePlayers', players);
            });

            // Tangani disconnect
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                delete players[socket.id]; // Hapus pemain dari daftar
                io.emit('updatePlayers', players); // Kirim pembaruan ke semua klien
            });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});