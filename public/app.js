// ====================================
// PerkPocket Main Application Script
// Handles country selection, offers, and display
// ====================================

document.addEventListener("DOMContentLoaded", () => {
  const offersContainer = document.getElementById("offers-container");
  const offersList = document.getElementById("offers-list");
  const mainHeader = document.getElementById("main-header");
  const footer = document.getElementById("footer");
  const chatbot = document.getElementById("chatbot-container");
  const regionName = document.getElementById("region-name");

  const auBtn = document.getElementById("au-btn");
  const ukBtn = document.getElementById("uk-btn");
  const countrySelector = document.getElementById("country-selector");

  let userRegion = "All";

  // Load offers from JSON
  async function loadOffers() {
    try {
      const response = await fetch("offers.json");
      const offers = await response.json();
      renderOffers(offers);
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  }

  // Render Offers
  function renderOffers(offers) {
    offersList.innerHTML = "";
    offers.forEach(offer => {
      const card = document.createElement("div");
      card.classList.add("offer-card");

      card.innerHTML = `
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
        <a href="${offer.link}" target="_blank">Get Offer</a>
      `;

      offersList.appendChild(card);
    });
  }

  // Show main content after selecting region
  function showMain() {
    countrySelector.classList.add("hidden");
    mainHeader.classList.remove("hidden");
    offersContainer.classList.remove("hidden");
    chatbot.classList.remove("hidden");
    footer.classList.remove("hidden");
    loadOffers();
  }

  // Region Buttons
  auBtn.addEventListener("click", () => {
    userRegion = "Australia 🇦🇺";
    regionName.textContent = userRegion;
    showMain();
  });

  ukBtn.addEventListener("click", () => {
    userRegion = "United Kingdom 🇬🇧";
    regionName.textContent = userRegion;
    showMain();
  });
});
