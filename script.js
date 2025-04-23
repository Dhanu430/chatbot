document.addEventListener("DOMContentLoaded", function () {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("You must be logged in to access the chatbot!");
        window.location.href = "login.html";
    }

    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            alert("Logged out successfully!");
            window.location.href = "login.html";
        });
    }

    // Dark Mode Toggle
    const toggleBtn = document.getElementById("toggle");
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", isDarkMode);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
        });
    }

    // Chatbot Functionality
    const inputField = document.getElementById("input");
    const sendButton = document.getElementById("sendButton");
    const messagesContainer = document.getElementById("messages");

    function sendMessage() {
        let input = inputField.value.trim().toLowerCase(); // Convert input to lowercase
        if (!input) {
            alert("Please enter a message.");
            return;
        }
        inputField.value = "";
        processMessage(input);
    }

    sendButton.addEventListener("click", sendMessage);
    inputField.addEventListener("keydown", (e) => {
        if (e.code === "Enter") sendMessage();
    });

    // Predefined Responses
    const predefinedReplies = {
        "hi": "Hello! How can I assist you?",
        "hello": "Hi there! Need any help?",
        "how are you": "I'm just a bot, but I'm here to help you!",
        "what is your name": "I am your chatbot assistant.",
        "bye": "Goodbye! Have a great day!",
        "thank you": "You're welcome! 😊",
    };

    // Persistent Chat History
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    function addChat(input, response) {
        let userDiv = document.createElement("div");
        userDiv.className = "message user-message"; // ✅ User message aligned LEFT
        userDiv.innerHTML = `<span>${input}</span>`;
        messagesContainer.appendChild(userDiv);

        let botDiv = document.createElement("div");
        botDiv.className = "message bot-message"; // ✅ Bot message aligned RIGHT
        botDiv.innerText = response;
        messagesContainer.appendChild(botDiv);

        chatHistory.push({ input, response });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function processMessage(input) {
        if (predefinedReplies[input]) {
            addChat(input, predefinedReplies[input]); // Use predefined response
        } else {
            output(input); // Use AI response as fallback
        }
    }

    // Speech Recognition (Microphone)
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const micButton = document.getElementById("micButton");
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
            inputField.value = event.results[0][0].transcript;
            sendMessage();
        };
        micButton.addEventListener("click", () => recognition.start());
    } else {
        console.warn("Speech recognition not supported in this browser.");
    }

    // ChatGPT API Integration (Fallback)
    async function getChatGPTResponse(message) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer YOUR_OPENAI_API_KEY`
                },
                body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: message }] })
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error fetching ChatGPT response:", error);
            return "I'm having trouble responding right now. Please try again later.";
        }
    }

    async function output(input) {
        let response = await getChatGPTResponse(input);
        addChat(input, response);
    }
});
