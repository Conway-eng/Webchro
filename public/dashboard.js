// Handles countdown and WhatsApp/claim logic on dashboard

document.addEventListener("DOMContentLoaded", function () {
  if (typeof countdown !== "undefined" && !claimedToday) {
    let countdownElem = document.getElementById("countdown");
    let claimForm = document.getElementById("claimForm");
    let whatsappBtn = document.getElementById("whatsappBtn");
    let claimBtn = document.getElementById("claimBtn");

    let seconds = countdown;
    function updateCountdown() {
      if (seconds > 0) {
        countdownElem.textContent = `Wait ${seconds}s to claim your coins`;
        claimForm.style.display = "none";
      } else {
        countdownElem.textContent = "Step 1: Join our WhatsApp channel";
        claimForm.style.display = "block";
        whatsappBtn.style.display = "inline-block";
        // Show claim button after WhatsApp button is clicked
        whatsappBtn.onclick = function () {
          whatsappBtn.style.display = "none";
          claimBtn.style.display = "inline-block";
        };
      }
    }

    updateCountdown();
    let interval = setInterval(() => {
      seconds--;
      if (seconds < 0) {
        clearInterval(interval);
        updateCountdown();
      } else {
        updateCountdown();
      }
    }, 1000);
  }
});
