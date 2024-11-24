const virtualGuests = [
    { nickname: 'Sanja', messages: ['Poz Svima', 'jasaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'], color: 'deepskyblue' },
    { nickname: 'Tanja', messages: ['Zdravo Sarinenge', 'opaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'], color: 'purple' },
    { nickname: 'Anja', messages: ['Selami sarinenge', 'tooOOOOOOOOOOOOOOOOOOOOOOO'], color: 'red' },
];

function sendMessageToChat(guest, message) {
    const messageArea = document.getElementById('messageArea');

    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<span style="color: ${guest.color}; font-weight: bold; font-style: italic;">${guest.nickname}: ${message}</span>`;
    
    // Dodavanje poruke na vrh
    messageArea.insertBefore(messageElement, messageArea.firstChild);
    
    // Dodavanje razmaka između poruka
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '10px'; // Podešavanje visine razmaka
    messageArea.insertBefore(spacingElement, messageArea.firstChild.nextSibling); // Razmak nakon poruke

    messageArea.scrollTop = 0; // Skrolovanje na vrh
}

function addGuestsToList() {
    const guestList = document.getElementById('guestList');
    
    // Dodavanje gostiju samo jednom
    virtualGuests.forEach(guest => {
        if (!Array.from(guestList.children).some(el => el.textContent === guest.nickname)) {
            const guestElement = document.createElement('div');
            guestElement.classList.add('guest');
            guestElement.textContent = guest.nickname;
            guestElement.style.color = guest.color; // Postavljanje boje za gosta

            guestList.appendChild(guestElement);
        }
    });
}

function startVirtualGuests() {
    const messageTimings = [];
    const timeBetweenMessages = 180; // 3 minuta razmaka (180 sekundi)

    // Generisanje vremena za slanje poruka svakom gostu
    virtualGuests.forEach((guest, guestIndex) => {
        guest.messages.forEach((message, messageIndex) => {
            const timeOffset = guestIndex * guest.messages.length * timeBetweenMessages + messageIndex * timeBetweenMessages;
            messageTimings.push({ guestIndex, messageIndex, time: timeOffset });
        });
    });

    // Slanje poruka prema izračunatom vremenu
    messageTimings.forEach(({ guestIndex, messageIndex, time }) => {
        setTimeout(() => {
            sendMessageToChat(virtualGuests[guestIndex], virtualGuests[guestIndex].messages[messageIndex]);
        }, time * 1000); // Konvertovanje sekundi u milisekunde
    });

    // Pauza pre ponovnog ciklusa (ako je potrebno)
    setTimeout(startVirtualGuests, 240 * 1000); // Ponovo pokreni nakon 240 sekundi (4 minuta pauza)
}

// Dodavanje gostiju na listu odmah kada se stranica učita
window.onload = () => {
    addGuestsToList();  // Dodavanje gostiju na listu
    startVirtualGuests();  // Pokretanje virtuelnih gostiju
};
