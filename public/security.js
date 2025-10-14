// ==========================
//  PerkPocket Security Layer
//  Handles hCaptcha verification
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  const captchaGate = document.getElementById("captcha-gate");
  const verifyBtn = document.getElementById("verify-btn");
  const countrySelector = document.getElementById("country-selector");

  // Step 1: User clicks Verify after completing captcha
  verifyBtn.addEventListener("click", () => {
    const captchaResponse = document.querySelector("[name='h-captcha-response']");
    if (captchaResponse && captchaResponse.value.trim() !== "") {
      captchaGate.classList.add("hidden");
      countrySelector.classList.remove("hidden");
    } else {
      alert("Please complete the captcha before continuing.");
    }
  });
});
