let privilegedUsers = new Set();  // Privilegovani korisnici
let bannedUsers = new Set();  // Banovani korisnici
let guestList = new Set();  // Lista svih gostiju koji su povezani

function setupSocketEvents(io) {
    io.on('connection', (socket) => {
        console.log(`Korisnik povezan: ${socket.id}`);

        // Početna provera - diskonektuj ako je banovan
        if (bannedUsers.has(socket.id)) {
            socket.emit('banned', 'Banovani ste sa servera.');
            socket.disconnect(true);
            return;
        }

        // Registracija korisnika
        socket.on('registerUser', (userId) => {
            guestList.add(userId);  // Dodajemo korisnika u guest list
            console.log(`Korisnik ${userId} registrovan sa socket ID-jem ${socket.id}.`);
        });

        // Lozinka
        socket.on('enterPassword', (password) => {
            const correctPassword = 'galaksija123';
            if (password === correctPassword) {
                privilegedUsers.add(socket.id);
                socket.emit('password_success', "Pristup odobren.");
                console.log(`Korisnik ${socket.id} je dobio privilegije.`);
            } else {
                socket.emit('password_failed', "Pogrešna lozinka.");
            }
        });

        // Banovanje korisnika
        socket.on('banUser', (userId) => {
            if (!privilegedUsers.has(socket.id)) {
                socket.emit('error', "Nemate prava za banovanje.");
                return;
            }

            if (!guestList.has(userId)) {
                socket.emit('error', "Korisnik nije u guest listi.");
                return;
            }

            bannedUsers.add(userId);
            console.log(`Korisnik ${userId} je banovan od strane ${socket.id}.`);
            io.emit('userBanned', userId); // Obavesti sve klijente
        });

        // Odbanovanje korisnika
        socket.on('unbanUser', (userId) => {
            if (!privilegedUsers.has(socket.id)) {
                socket.emit('error', "Nemate prava za odbanovanje.");
                return;
            }

            bannedUsers.delete(userId);
            console.log(`Korisnik ${userId} je odbanovan od strane ${socket.id}.`);
            io.emit('userUnbanned', userId); // Obavesti sve klijente
        });

        // Diskonektovanje korisnika
        socket.on('disconnect', () => {
            console.log(`Korisnik ${socket.id} se odjavio.`);
            guestList.delete(socket.id); // Uklanjamo korisnika sa guest list
            privilegedUsers.delete(socket.id);  // Uklanjamo privilegije
        });
    });
}

module.exports = { setupSocketEvents };
