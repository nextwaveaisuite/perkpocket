// ==============================
//  PerkPocket Admin Management
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  const adminOffers = document.getElementById("admin-offers");

  try {
    const response = await fetch("../offers.json");
    const offers = await response.json();

    adminOffers.innerHTML = "";
    offers.forEach(offer => {
      const card = document.createElement("div");
      card.classList.add("offer-card");
      card.innerHTML = `
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
        <a href="${offer.link}" target="_blank">Test Link</a>
      `;
      adminOffers.appendChild(card);
    });
  } catch (error) {
    adminOffers.innerHTML = `<p>⚠️ Failed to load offers.json</p>`;
    console.error(error);
  }
});
