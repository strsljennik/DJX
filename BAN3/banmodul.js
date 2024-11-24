let privilegedUsers = new Set(); // Privilegovani korisnici
let bannedUsers = new Set(); // Banovani korisnici
let connectedUsers = new Map(); // Mapira userId na socket.id

function setupSocketEvents(io) {
    io.on('connection', (socket) => {
        console.log(`Korisnik povezan: ${socket.id}`);

        // Registracija korisnika
        socket.on('registerUser', (userId) => {
            // Dodajemo povezani userId sa odgovarajućim socket.id
            connectedUsers.set(userId, socket.id);
            console.log(`Korisnik ${userId} registrovan sa socket ID-jem ${socket.id}`);
        });

        // Banovanje korisnika
        socket.on('banUser', (userId) => {
            if (!privilegedUsers.has(socket.id)) {
                socket.emit('error', "Nemate prava za banovanje.");
                return;
            }

            const targetSocketId = connectedUsers.get(userId);
            if (!targetSocketId) {
                socket.emit('error', "Korisnik nije povezan.");
                return;
            }

            bannedUsers.add(targetSocketId);
            io.to(targetSocketId).emit('banned', "Banovani ste sa servera.");
            const targetSocket = io.sockets.sockets.get(targetSocketId);
            if (targetSocket) targetSocket.disconnect(true); // Prekini vezu
            console.log(`Korisnik ${userId} je banovan od strane ${socket.id}.`);

            io.emit('userBanned', userId); // Obavesti sve klijente
        });

        // Odbanovanje korisnika
        socket.on('unbanUser', (userId) => {
            if (!privilegedUsers.has(socket.id)) {
                socket.emit('error', "Nemate prava za odbanovanje.");
                return;
            }

            const targetSocketId = connectedUsers.get(userId);
            if (targetSocketId) {
                bannedUsers.delete(targetSocketId);
                console.log(`Korisnik ${userId} je odbanovan od strane ${socket.id}.`);
                io.emit('userUnbanned', userId); // Obavesti sve klijente
            }
        });

        // Diskonektovanje korisnika
        socket.on('disconnect', () => {
            console.log(`Korisnik ${socket.id} se odjavio.`);
            // Brisanje korisnika sa svih lista kada se diskonektuje
            for (let [userId, id] of connectedUsers) {
                if (id === socket.id) {
                    connectedUsers.delete(userId);
                    break;
                }
            }
            bannedUsers.delete(socket.id);
            privilegedUsers.delete(socket.id);
        });
    });
}

module.exports = { setupSocketEvents };
