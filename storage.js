const storage = require('node-persist');
const path = require('path');
const fs = require('fs');

// Putanja do direktorijuma u kojem će biti sačuvani podaci
const storageDir = path.join(__dirname, 'cuvati');

// Automatska inicijalizacija skladišta
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
        console.log(`[INFO] Skladište se nalazi u direktorijumu: ${storageDir}`);
    } catch (error) {
        console.error('[ERROR] Greška pri inicijalizaciji skladišta:', error);
    }
}

// Funkcija za dodavanje ili ažuriranje podataka o gostu
async function saveGuestData(nickname, color) {
    try {
        await initializeStorage();

        // Provera da li je nickname validan
        if (!nickname || typeof nickname !== 'string') {
            console.error('[ERROR] Nickname mora biti prosleđen i mora biti tipa string!');
            return;
        }

        // Kreiraj objekat s novim vrednostima
        const guestData = {
            nik: nickname,
            color: color || 'default',  // Ako boja nije prosleđena, koristi 'default'
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

// Testiranje servera
async function testServer() {
    await saveGuestData('gost-1', 'plava');
    await saveGuestData('gost-2', 'crvena');
    await loadAllGuests();
}

// Pokreni server
async function startServer() {
    await initializeStorage();
    console.log('[INFO] Server je spreman!');
    await loadAllGuests();
}

// Pokreni server
startServer();

// Izvoz funkcija za dodatnu upotrebu
module.exports = {
    saveGuestData,
    loadAllGuests,
    initializeStorage,
};