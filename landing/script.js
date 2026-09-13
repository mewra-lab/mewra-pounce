document.addEventListener("DOMContentLoaded", () => {
  // MARK: - Terminal Tabs Switcher
  const termTabs = document.querySelectorAll(".term-tab");
  const termCmd = document.getElementById("terminal-cmd");
  const promptSymbol = document.getElementById("prompt-symbol");
  let currentCmd = "ext install mewra.mewra-pounce";

  termTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      termTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const cmd = tab.getAttribute("data-cmd");
      const prompt = tab.getAttribute("data-prompt") || ">";
      if (termCmd && cmd) {
        termCmd.textContent = cmd;
        currentCmd = cmd;
      }
      if (promptSymbol) {
        promptSymbol.textContent = prompt;
      }
    });
  });

  // MARK: - Copy Command Button
  const copyBtn = document.getElementById("copy-btn");
  const copyText = document.getElementById("copy-text");

  if (copyBtn && copyText) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentCmd);
        const original = copyText.textContent;
        copyText.textContent = "Copied!";
        copyBtn.style.color = "#10b981";
        copyBtn.style.borderColor = "#10b981";
        setTimeout(() => {
          copyText.textContent = original;
          copyBtn.style.color = "";
          copyBtn.style.borderColor = "";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    });
  }
});
