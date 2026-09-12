document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copy-btn");
  const copyText = document.getElementById("copy-text");

  if (copyBtn && copyText) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("ext install mewra.mewra-pounce");
        copyText.textContent = "Copied!";
        copyBtn.style.borderColor = "#10b981";
        setTimeout(() => {
          copyText.textContent = "Copy";
          copyBtn.style.borderColor = "";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    });
  }
});
