(function () {
  const status = document.querySelector("#launcher-status");

  function openExtensionPage(path) {
    chrome.tabs.create({ url: chrome.runtime.getURL(path) });
    window.close();
  }

  function openSupportEmail(subject, prompt) {
    const body = [prompt, "", "What would you like to happen?", "", "Why would this be useful?", "", `Extension version: ${chrome.runtime.getManifest().version}`].join("\n");
    const url = `mailto:boni.aditya@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    chrome.tabs.create({ url }, () => {
      if (chrome.runtime.lastError && status) status.textContent = "Unable to open your email app.";
    });
  }

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open]");
    const storeButton = event.target.closest("[data-store-mode]");
    if (openButton) return openExtensionPage(openButton.dataset.open);
    if (storeButton) openExtensionPage(`newtab.html?demo=${storeButton.dataset.storeMode === "demo" ? "on" : "off"}`);
  });

  document.querySelector("#request-feature")?.addEventListener("click", () => openSupportEmail("ToDoList Cart feature request", "I would like to request a new feature for ToDoList Cart."));
  document.querySelector("#report-problem")?.addEventListener("click", () => openSupportEmail("ToDoList Cart problem report", "I found a problem while using ToDoList Cart."));
})();
