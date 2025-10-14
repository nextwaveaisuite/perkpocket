// ==================================
// PerkPocket Chatbot Assistant
// Simple text-based helper
// ==================================

document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (!chatInput || !chatMessages) return;

  const responses = {
    "hello": "Hey there! 👋 How can I help you save today?",
    "offer": "You can explore offers above — each gives cashback or discounts!",
    "help": "Simply click on an offer to go to the partner site.",
    "australia": "Currently showing offers for Australia 🇦🇺.",
    "uk": "Currently showing offers for the United Kingdom 🇬🇧.",
  };

  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.classList.add("msg");
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
      const userText = chatInput.value.trim().toLowerCase();
      appendMessage("You", chatInput.value);
      chatInput.value = "";

      let reply = "I'm not sure about that, but check out the top offers!";
      for (let key in responses) {
        if (userText.includes(key)) {
          reply = responses[key];
          break;
        }
      }
      setTimeout(() => appendMessage("Bot", reply), 400);
    }
  });
});
