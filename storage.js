const express = require('express');
const storage = require('node-persist');
const path = require('path');
const fs = require('fs');

// Putanja do direktorijuma u kojem će biti sačuvani podaci
const storageDir = path.join(__dirname, 'cuvati');

// Inicijalizacija aplikacije
const app = express();
app.use(express.json()); // Omogućava parsiranje JSON tela u zahtevima

// Inicijalizacija skladišta
async function initializeStorage() {
    try {
        // Ako direktorijum ne postoji, kreiraj ga
        if (!fs.existsSync(storageDir)) {
            console.log('[INFO] Direktorijum "cuvati" ne postoji. Kreiramo ga...');
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Inicijalizacija skladišta sa direktorijumom
        await storage.init({
            dir: storageDir, // koristi lokalni direktorijum 'cuvati'
            forgiveParseErrors: true, // ignoriši greške prilikom parsiranja podataka
        });
        console.log('[INFO] Skladište je uspešno inicijalizovano.');
    } catch (error) {
        console.error('[ERROR] Greška pri inicijalizaciji skladišta:', error);
    }
}

// Funkcija za dodavanje ili ažuriranje podataka o gostu
async function saveGuestData(nickname, color, ipAddress) {
    try {
        // Provera da li je nickname validan
        if (!nickname || typeof nickname !== 'string') {
            console.error('[ERROR] Nickname mora biti prosleđen i mora biti tipa string!');
            return;
        }

        // Kreiraj objekat s novim vrednostima
        const guestData = {
            nik: nickname,
            color: color || 'default',  // Ako boja nije prosleđena, koristi 'default'
            ip: ipAddress || 'Nema IP adrese', // Sačuvaj IP adresu
        };

        // Logovanje podataka pre nego što ih sačuvamo
        console.log(`[INFO] Sačuvaj podatke za gosta ${nickname}:`, guestData);

        // Sačuvaj ažurirane podatke
        await storage.setItem(nickname, guestData);
        console.log(`[INFO] Podaci za gosta ${nickname} su sačuvani:`, guestData);
    } catch (err) {
        console.error(`[ERROR] Greška prilikom čuvanja podataka za gosta ${nickname}:`, err);
    }
}

// POST ruter za unos podataka o gostu
app.post('/save', async (req, res) => {
    const { nickname, color } = req.body;
    const ipAddress = req.ip;  // Dohvata IP adresu korisnika sa zahteva

    // Poziv funkcije da sačuva podatke o gostu
    await saveGuestData(nickname, color, ipAddress);

    // Odgovaramo korisniku
    res.send('Podaci su sačuvani!');
});

// Funkcija za učitavanje svih gostiju
async function loadAllGuests() {
    try {
        const keys = await storage.keys();

        if (keys.length === 0) {
            console.log('[INFO] Nema gostiju. Dodajte goste!');
            return;
        }

        console.log(`[INFO] Nađeno ${keys.length} gostiju:`, keys);

        const guestPromises = keys.map(async (key) => {
            const guestData = await storage.getItem(key);

            if (!guestData) {
                console.warn(`[WARN] Podaci za gosta ${key} nisu pronađeni ili su nevalidni.`);
                return;
            }

            console.log(`${key}:`, guestData);
        });

        await Promise.all(guestPromises);
    } catch (err) {
        console.error('[ERROR] Greška prilikom učitavanja svih gostiju:', err);
    }
}

// Pokreni server
async function startServer() {
    // Prvo inicijalizuj skladište
    await initializeStorage(); 
    console.log('[INFO] Server je spreman!');
    await loadAllGuests();
}

// Pokreni server na portu 3000
app.listen(3000, () => {
    console.log('Server pokrenut na portu 3000');
    startServer();
});
