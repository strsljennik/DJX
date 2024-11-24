document.addEventListener("DOMContentLoaded", () => {
    const PASSWORD = "galaksija123";
    let hasBanPrivilege = false;
    let isBanned = false; // Dodajemo varijablu za praćenje statusa banovanja

    const guestList = document.getElementById("guestList");
    const banButton = document.getElementById("banned");
    const chatContainer = document.getElementById("chatContainer"); // Dodajemo referencu na chat

    // Funkcija za proveru lozinke
    function promptPassword() {
        const password = prompt("Unesite lozinku:");
        if (password === PASSWORD) {
            alert("Pristup odobren!");
            hasBanPrivilege = true;
            socket.emit('enterPassword', password);  // Pošaljemo lozinku serveru
        } else {
            alert("Pogrešna lozinka!");
        }
    }

    // Event za unos lozinke
    if (banButton) {
        banButton.addEventListener("click", promptPassword);
    }

    // Provera da li postoji guestList
    if (!guestList) {
        console.error("Element sa id='guestList' nije pronađen.");
        return;
    }

    // Dvoklik za interakciju sa gostima
    guestList.addEventListener("dblclick", (event) => {
        const target = event.target;
        if (!target.classList.contains("guest")) return;

        const userId = target.getAttribute("data-id") || `guest_${Date.now()}`;
        target.setAttribute("data-id", userId);

        if (hasBanPrivilege) {
            const action = target.classList.toggle("banned") ? "banUser" : "unbanUser";
            target.style.backgroundColor = action === "banUser" ? "red" : "";
            target.textContent = `${target.textContent.replace(" (B)", "")}${action === "banUser" ? " (B)" : ""}`;
            socket.emit(action, userId);  // Pošaljite događaj na server
        } else {
            alert("Nemate privilegije za banovanje korisnika.");
        }
    });

    // Slušanje događaja za banovanje na serveru
    socket.on("userBanned", (userId) => {
        console.log(`User ${userId} banned by server`);
        const elements = document.querySelectorAll(`.guest[data-id='${userId}']`);
        elements.forEach((el) => {
            el.classList.add("banned");
            el.style.backgroundColor = "red";
            if (!el.textContent.includes(" (B)")) {
                el.textContent += " (B)";
            }
        });

        // Ako je banovan trenutni korisnik, onemogući chat
        if (userId === socket.id) {
            isBanned = true;
            alert("You have been banned and cannot interact with the chat.");
            document.getElementById('chat-input').disabled = true;
            document.getElementById('send-button').disabled = true;
            chatContainer.style.display = 'none'; // Sakrij chat
        }
    });

    // Slušanje događaja za odbanovanje na serveru
    socket.on("userUnbanned", (userId) => {
        console.log(`User ${userId} unbanned by server`);
        const elements = document.querySelectorAll(`.guest[data-id='${userId}']`);
        elements.forEach((el) => {
            el.classList.remove("banned");
            el.style.backgroundColor = "";
            el.textContent = el.textContent.replace(" (B)", "");
        });

        // Ako je odbanovan trenutni korisnik, ponovo omogući chat
        if (userId === socket.id) {
            isBanned = false;
            alert("You have been unbanned and can now interact with the chat.");
            document.getElementById('chat-input').disabled = false;
            document.getElementById('send-button').disabled = false;
            chatContainer.style.display = 'block'; // Prikazuj ponovo chat
        }
    });

    // Funkcija koja prati unos poruka
    document.getElementById('chat-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (isBanned) {
                alert('Banovani ste i ne možete slati poruke.');
                return;
            }

            const message = this.value;
            socket.emit('chatMessage', { text: message, bold: false, italic: false, color: 'black' });
            this.value = ''; // Isprazni polje za unos
        }
    });
});
