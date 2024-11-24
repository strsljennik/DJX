document.addEventListener("DOMContentLoaded", () => {
    const PASSWORD = "galaksija123";
    let hasBanPrivilege = false;
    let isBanned = false;

    const guestList = document.getElementById("guestList");
    const banButton = document.getElementById("banned");
    const chatContainer = document.getElementById("chatContainer");

    function promptPassword() {
        const password = prompt("Unesite lozinku:");
        if (password === PASSWORD) {
            alert("Pristup odobren!");
            hasBanPrivilege = true;
        } else {
            alert("Pogrešna lozinka!");
        }
    }

    if (banButton) {
        banButton.addEventListener("click", promptPassword);
    }

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
        const elements = document.querySelectorAll(`.guest[data-id='${userId}']`);
        elements.forEach((el) => {
            el.classList.add("banned");
            el.style.backgroundColor = "red";
            if (!el.textContent.includes(" (B)")) {
                el.textContent += " (B)";
            }
        });
        if (userId === socket.id) {
            isBanned = true;
            alert("You have been banned and cannot interact with the chat.");
            document.getElementById('chat-input').disabled = true;
            document.getElementById('send-button').disabled = true;
            chatContainer.style.display = 'none'; 
        }
    });

    // Slušanje događaja za odbanovanje na serveru
    socket.on("userUnbanned", (userId) => {
        const elements = document.querySelectorAll(`.guest[data-id='${userId}']`);
        elements.forEach((el) => {
            el.classList.remove("banned");
            el.style.backgroundColor = "";
            el.textContent = el.textContent.replace(" (B)", "");
        });
        if (userId === socket.id) {
            isBanned = false;
            alert("You have been unbanned and can now interact with the chat.");
            document.getElementById('chat-input').disabled = false;
            document.getElementById('send-button').disabled = false;
            chatContainer.style.display = 'block'; 
        }
    });

    document.getElementById('chat-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (isBanned) {
                alert('Banovani ste i ne možete slati poruke.');
                return;
            }

            const message = document.getElementById('chat-input').value;
            socket.emit('chatMessage', { text: message, bold: false, italic: false, color: 'black' });
        }
    });
});
