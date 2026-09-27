(function () {
  const Store = globalThis.ToDoCartStore;
  const embedded = new URLSearchParams(window.location.search).get("embedded") === "1";
  document.body.classList.toggle("embedded-settings-page", embedded);
  const state = { data: Store.normalizeData({}), previewLayout: "grid" };
  const optionNames = [
    "ShowImages", "CompactMode", "ShowProductDescriptions", "ShowDeliveryStatus",
    "ShowLocationIcon", "ShowTimeIcon", "ShowPrice", "ShowTime", "ShowCategory",
    "ShowLocation", "ShowRatings", "ShowMoq", "ShowUnits"
  ];
  const defaultValues = {
    ShowImages: true,
    CompactMode: true,
    ShowProductDescriptions: false,
    ShowDeliveryStatus: false,
    ShowLocationIcon: false,
    ShowTimeIcon: false,
    ShowPrice: false,
    ShowTime: false,
    ShowCategory: false,
    ShowLocation: false,
    ShowRatings: false,
    ShowMoq: false,
    ShowUnits: false
  };
  const elements = {
    brandName: document.querySelector(".brand-name"),
    departments: document.querySelector(".departments"),
    cartCount: document.querySelector("#cart-count"),
    form: document.querySelector("#popup-settings-form"),
    status: document.querySelector("#popup-settings-status"),
    reset: document.querySelector("#reset-popup-settings"),
    previewCard: document.querySelector("#popup-preview-card"),
    previewImage: document.querySelector("#popup-preview-product-image"),
    previewDescription: document.querySelector("#popup-preview-product-description"),
    previewDeliveryStatus: document.querySelector("#popup-preview-delivery-status"),
    previewLocationIcon: document.querySelector("#popup-preview-location-icon"),
    previewTimeIcon: document.querySelector("#popup-preview-time-icon")
  };

  optionNames.forEach((name) => {
    const idName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    elements[name] = document.querySelector(`#setting-popup-${idName.slice(1)}`);
  });

  function renderCategories() {
    elements.departments.replaceChildren();
    const all = document.createElement("a");
    all.href = "newtab.html";
    all.textContent = "All";
    elements.departments.append(all);
    state.data.categories.forEach((category) => {
      const link = document.createElement("a");
      link.href = `newtab.html?department=${encodeURIComponent(category.id)}`;
      Store.renderCategory(link, state.data, category.id);
      elements.departments.append(link);
    });
  }

  function settingKey(name) {
    return `popup${name}`;
  }

  function applySettingsToForm() {
    optionNames.forEach((name) => {
      elements[name].checked = Boolean(state.data.settings[settingKey(name)]);
    });
  }

  function renderPreview() {
    const showImages = elements.ShowImages.checked;
    elements.previewLocationIcon.hidden = !elements.ShowLocationIcon.checked;
    elements.previewTimeIcon.hidden = !elements.ShowTimeIcon.checked;
    elements.previewImage.textContent = showImages ? "Product" : "No image";
    elements.previewImage.classList.toggle("is-placeholder", !showImages);
    elements.previewDescription.hidden = !elements.ShowProductDescriptions.checked;
    elements.previewDeliveryStatus.hidden = !elements.ShowDeliveryStatus.checked;
    elements.previewCard.classList.toggle("is-compact", elements.CompactMode.checked);
    elements.previewCard.classList.toggle("is-list-preview", state.previewLayout === "list");
    elements.previewCard.querySelector(".price-label").hidden = !elements.ShowPrice.checked;
    elements.previewCard.querySelector(".time-label").hidden = !elements.ShowTime.checked;
    elements.previewCard.querySelector(".department-label").hidden = !elements.ShowCategory.checked;
    elements.previewCard.querySelector(".location-label").hidden = !elements.ShowLocation.checked;
    elements.previewCard.querySelector(".settings-preview-rating").hidden = !elements.ShowRatings.checked;
    elements.previewCard.querySelector(".moq-label").hidden = !elements.ShowMoq.checked;
    elements.previewCard.querySelector(".units-label").hidden = !elements.ShowUnits.checked;
    elements.previewCard.querySelector(".price-label").textContent = Store.formatMoney("128", state.data.settings);
    document.querySelectorAll("[data-preview-layout]").forEach((button) => {
      const selected = button.dataset.previewLayout === state.previewLayout;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function render() {
    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = String(Store.getActiveCart(state.data).items.length);
    renderCategories();
    applySettingsToForm();
    renderPreview();
  }

  function showStatus(message) {
    elements.status.textContent = message;
  }

  async function saveSettings(event) {
    event.preventDefault();
    const updates = {};
    optionNames.forEach((name) => {
      updates[settingKey(name)] = elements[name].checked;
    });
    state.data.settings = Store.normalizeSettings({ ...state.data.settings, ...updates }, state.data.categories);
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Popup settings saved.");
  }

  function resetDefaults() {
    optionNames.forEach((name) => {
      elements[name].checked = defaultValues[name];
    });
    renderPreview();
    showStatus("Popup defaults restored. Save to apply them.");
  }

  function bindEvents() {
    elements.form.addEventListener("submit", saveSettings);
    elements.reset.addEventListener("click", resetDefaults);
    optionNames.forEach((name) => elements[name].addEventListener("change", renderPreview));
    document.querySelectorAll("[data-preview-layout]").forEach((button) => {
      button.addEventListener("click", () => {
        state.previewLayout = button.dataset.previewLayout;
        renderPreview();
      });
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
  }

  init();
})();
