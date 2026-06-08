pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfText = "";
let isLoading = false;

const ENCRYPTED_API_KEY = "d3ch7fh0ghf513hf1757067e941457d8fh31f20d7694e3ec6c4657chcc76g4cg#4x#tq#mu";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/auto";

const CHATBOT_CONFIG = {
    PDF_PATH: "chatbot/Omkar_Chatbot_QA_Training_Updated.pdf"
};

function decryptKey(text) {
    text = text.split("").reverse().join("");
    let decrypted = "";
    for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
            decrypted += String.fromCharCode(ch.charCodeAt(0) - 2);
        } else if (ch >= '0' && ch <= '9') {
            let num = parseInt(ch) - 3;
            if (num < 0) num += 10;
            decrypted += num;
        } else {
            decrypted += "-"; // # was originally - in the API key
        }
    }
    return decrypted;
}

document.addEventListener("DOMContentLoaded", () => {
    initializeChatbot();
});

function initializeChatbot() {
    const chatbotBtn = document.getElementById("chatbotBtn");
    const chatbotPopup = document.getElementById("chatbotPopup");
    const chatbotClose = document.getElementById("chatbotClose");
    const chatbotClear = document.getElementById("chatbotClear");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");

    if (!chatbotBtn) return;

    chatbotBtn.addEventListener("click", () => {
        chatbotPopup.classList.toggle("active");
        if (chatbotPopup.classList.contains("active")) {
            chatInput.focus();
        }
    });

    if (chatbotClose) {
        chatbotClose.addEventListener("click", () => {
            chatbotPopup.classList.remove("active");
        });
    }

    if (chatbotClear) {
        chatbotClear.addEventListener("click", () => {
            chatMessages.innerHTML = "";
            addMessage("bot", "Chat cleared! Ask me anything about Omkar.", chatMessages);
        });
    }

    if (chatSend) {
        chatSend.addEventListener("click", () => sendMessage(chatMessages, chatInput));
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !isLoading) {
                sendMessage(chatMessages, chatInput);
            }
        });
    }

    loadPDF(chatMessages);
}

async function loadPDF(chatMessages) {
    try {
        const pdf = await pdfjsLib.getDocument(CHATBOT_CONFIG.PDF_PATH).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        pdfText = fullText;
        addMessage("bot", "Hi! I'm Omkar's AI assistant. Ask me anything about Omkar! 👋", chatMessages);
    } catch (err) {
        console.error("PDF load error:", err);
        addMessage("bot", "I'm ready to chat! Ask me anything about Omkar.", chatMessages);
    }
}

function addMessage(sender, message, chatMessages) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${sender}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "chatbot-message-content";

    if (sender === "bot") {
        message = formatBotMessage(message);
        contentDiv.innerHTML = message;
    } else {
        contentDiv.textContent = message;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatBotMessage(message) {
    let formatted = message.replace(/([IVX]+\.\s)/g, '<br>$1');
    formatted = formatted.replace(/^<br>/, '');
    return formatted;
}

function showTyping(chatMessages) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chatbot-message bot";
    messageDiv.id = "typing-indicator";

    const contentDiv = document.createElement("div");
    contentDiv.className = "chatbot-message-content chatbot-typing";
    contentDiv.innerHTML = "<span></span><span></span><span></span>";

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) typingIndicator.remove();
}

async function sendMessage(chatMessages, chatInput) {
    chatMessages = chatMessages || document.getElementById("chatMessages");
    chatInput = chatInput || document.getElementById("chatInput");

    const text = chatInput.value.trim();
    if (!text || isLoading) return;

    addMessage("user", text, chatMessages);
    chatInput.value = "";

    isLoading = true;
    showTyping(chatMessages);

    try {
        const reply = await askAI(text);
        removeTyping();
        addMessage("bot", reply, chatMessages);
    } catch (error) {
        console.error("Error:", error);
        removeTyping();
        addMessage("bot", "Sorry, I encountered an error. Please try again.", chatMessages);
    } finally {
        isLoading = false;
        chatInput.focus();
    }
}

async function askAI(message) {
    const API_KEY = decryptKey(ENCRYPTED_API_KEY);

    const prompt = pdfText && pdfText.length > 100
        ? `You are Omkar Kurane. Answer the question based on the document provided.

RULES:
- Format answer with roman numerals (I, II, III, etc.) followed by a period and space
- Each point on a new line
- No asterisks or bullet points
- Keep answers crisp and clear
- No unnecessary information
- First person as Omkar
- Maximum 3-4 points per answer

DOCUMENT:
${pdfText}

Question: ${message}`
        : `You are Omkar Kurane, a Full Stack Developer and AI Engineer from Bangalore, India. 
Answer using roman numerals (I, II, III, etc.) followed by a period and space.
Each point on a new line. No asterisks or bullet points. Keep it crisp.

Question: ${message}`;

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Omkar Chatbot"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [{ role: "user", content: prompt }]
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
    }

    if (data.error) return `Error: ${data.error.message}`;
    return "No response received";
}