(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    iconTarget: "new",
    newCategoryIcon: {
      icon: "",
      iconName: ""
    }
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    cartCount: document.querySelector("#cart-count"),
    productsCount: document.querySelector("#account-products-count"),
    cartsCount: document.querySelector("#account-carts-count"),
    ordersCount: document.querySelector("#account-orders-count"),
    form: document.querySelector("#settings-form"),
    accountName: document.querySelector("#setting-account-name"),
    storeName: document.querySelector("#setting-store-name"),
    defaultDepartment: document.querySelector("#setting-default-department"),
    defaultPriorityInputs: document.querySelectorAll("input[name='setting-default-priority']"),
    defaultMoq: document.querySelector("#setting-default-moq"),
    defaultPrice: document.querySelector("#setting-default-price"),
    checkoutBehavior: document.querySelector("#setting-checkout-behavior"),
    showImages: document.querySelector("#setting-show-images"),
    compactMode: document.querySelector("#setting-compact-mode"),
    categoryList: document.querySelector("#account-category-list"),
    categoryName: document.querySelector("#account-category-name"),
    addCategory: document.querySelector("#account-add-category"),
    newCategoryIconPreview: document.querySelector("#new-category-icon-preview"),
    chooseNewCategoryIcon: document.querySelector("#new-category-choose-icon"),
    iconPicker: document.querySelector("#icon-picker"),
    closeIconPicker: document.querySelector("#close-icon-picker"),
    iconSearchForm: document.querySelector("#icon-search-form"),
    iconSearchInput: document.querySelector("#icon-search-input"),
    iconSearchStatus: document.querySelector("#icon-search-status"),
    iconSearchResults: document.querySelector("#icon-search-results"),
    resetSettings: document.querySelector("#reset-settings"),
    exportData: document.querySelector("#export-data"),
    importData: document.querySelector("#import-data"),
    importDataFile: document.querySelector("#import-data-file"),
    status: document.querySelector("#settings-status"),
    openHomePage: document.querySelector("#open-home-page"),
    openProductsPage: document.querySelector("#open-products-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    cartJump: document.querySelector("#cart-jump")
  };

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function getDefaultPriorityValue() {
    return [...elements.defaultPriorityInputs].find((input) => input.checked)?.value || "standard";
  }

  function setDefaultPriorityValue(priority) {
    elements.defaultPriorityInputs.forEach((input) => {
      input.checked = input.value === priority;
    });
  }

  function renderCategoryOptions() {
    const currentValue = elements.defaultDepartment.value || state.data.settings.defaultDepartment;
    elements.defaultDepartment.replaceChildren();

    state.data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      elements.defaultDepartment.append(option);
    });

    elements.defaultDepartment.value = state.data.categories.some((category) => category.id === currentValue)
      ? currentValue
      : state.data.settings.defaultDepartment;
  }

  function createActionIcon(name) {
    const paths = {
      edit: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"],
      save: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z", "M17 21v-8H7v8", "M7 3v5h8"]
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("class", "action-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    paths[name].forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.append(path);
    });

    return svg;
  }

  function setActionButtonContent(button, icon, label) {
    const text = document.createElement("span");
    text.textContent = label;
    button.replaceChildren(createActionIcon(icon), text);
  }

  function renderCategoryList() {
    elements.categoryList.replaceChildren();

    state.data.categories.forEach((category) => {
      const item = document.createElement("li");
      item.className = "category-editor";
      item.dataset.categoryId = category.id;

      const preview = document.createElement("div");
      preview.className = "category-icon-preview";
      renderIconPreview(preview, category);

      const label = document.createElement("label");
      label.className = "visually-hidden";
      label.htmlFor = `category-name-${category.id}`;
      label.textContent = `Category name for ${category.name}`;

      const input = document.createElement("input");
      input.id = `category-name-${category.id}`;
      input.className = "category-name-edit";
      input.type = "text";
      input.maxLength = 32;
      input.value = category.name;

      const chooseIcon = document.createElement("button");
      chooseIcon.type = "button";
      chooseIcon.className = "secondary-button category-icon-button button-with-icon";
      chooseIcon.dataset.action = "choose-icon";
      setActionButtonContent(chooseIcon, "edit", "Choose Icon");

      const save = document.createElement("button");
      save.type = "button";
      save.className = "secondary-button category-save-button button-with-icon";
      save.dataset.action = "save-category";
      setActionButtonContent(save, "save", "Save");

      item.append(preview, label, input, chooseIcon, save);
      elements.categoryList.append(item);
    });
  }

  function renderIconPreview(container, category) {
    container.replaceChildren();
    const source = Store.getCategoryIconSource(category);

    if (source) {
      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      container.append(image);
      return;
    }

    const fallback = document.createElement("span");
    fallback.textContent = String(category?.name || "+").slice(0, 1).toUpperCase();
    container.append(fallback);
  }

  function renderNewCategoryIcon() {
    renderIconPreview(elements.newCategoryIconPreview, {
      name: elements.categoryName.value || "+",
      ...state.newCategoryIcon
    });
  }

  function renderSettings() {
    const settings = state.data.settings;
    elements.brandName.textContent = settings.storeName;
    renderCategoryOptions();
    renderCategoryList();
    renderNewCategoryIcon();
    elements.accountName.value = settings.accountName;
    elements.storeName.value = settings.storeName;
    elements.defaultDepartment.value = settings.defaultDepartment;
    setDefaultPriorityValue(settings.defaultPriority);
    elements.defaultMoq.value = settings.defaultMoq;
    elements.defaultPrice.value = settings.defaultPrice;
    elements.checkoutBehavior.value = settings.checkoutBehavior;
    elements.showImages.checked = settings.showImages;
    elements.compactMode.checked = settings.compactMode;
    document.body.classList.toggle("compact-mode", settings.compactMode);
  }

  function renderSummary() {
    const activeCart = getActiveCart();
    elements.cartCount.textContent = activeCart.items.length;
    elements.productsCount.textContent = `${state.data.products.length} ${state.data.products.length === 1 ? "product" : "products"}`;
    elements.cartsCount.textContent = `${state.data.carts.length} ${state.data.carts.length === 1 ? "cart" : "carts"}`;
    elements.ordersCount.textContent = `${state.data.orders.length} ${state.data.orders.length === 1 ? "order" : "orders"}`;
  }

  function render() {
    renderSettings();
    renderSummary();
  }

  function readFormSettings() {
    return Store.normalizeSettings({
      accountName: elements.accountName.value,
      storeName: elements.storeName.value,
      defaultDepartment: elements.defaultDepartment.value,
      defaultPriority: getDefaultPriorityValue(),
      defaultMoq: elements.defaultMoq.value,
      defaultPrice: elements.defaultPrice.value,
      checkoutBehavior: elements.checkoutBehavior.value,
      showImages: elements.showImages.checked,
      compactMode: elements.compactMode.checked
    }, state.data.categories);
  }

  function showStatus(message) {
    elements.status.textContent = message;
    window.setTimeout(() => {
      if (elements.status.textContent === message) {
        elements.status.textContent = "";
      }
    }, 2200);
  }

  async function saveSettings(event) {
    event.preventDefault();
    state.data.settings = readFormSettings();
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Settings saved.");
  }

  async function addCategoryFromInput() {
    const name = elements.categoryName.value.trim();

    if (!name) {
      return;
    }

    const existing = state.data.categories.find((category) => (
      category.name.toLowerCase() === name.toLowerCase()
    ));
    const category = existing || Store.createCategory({
      name,
      icon: state.newCategoryIcon.icon,
      iconName: state.newCategoryIcon.iconName
    }, state.data.categories);

    if (!existing) {
      state.data.categories.push(category);
    }

    state.data.settings.defaultDepartment = category.id;
    elements.categoryName.value = "";
    state.newCategoryIcon = { icon: "", iconName: "" };
    state.data = await Store.saveData(state.data);
    render();
    showStatus(existing ? "Category already exists." : "Category added.");
  }

  async function saveCategoryEdit(categoryId, name) {
    const nextName = name.trim();

    if (!nextName) {
      showStatus("Category name cannot be empty.");
      return;
    }

    const duplicate = state.data.categories.some((category) => (
      category.id !== categoryId && category.name.toLowerCase() === nextName.toLowerCase()
    ));

    if (duplicate) {
      showStatus("A category with that name already exists.");
      return;
    }

    state.data.categories = state.data.categories.map((category) => (
      category.id === categoryId ? { ...category, name: nextName } : category
    ));
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Category updated.");
  }

  function getIconUrl(iconName) {
    const [prefix, ...nameParts] = iconName.split(":");
    return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(nameParts.join(":"))}.svg?color=%23007185`;
  }

  function openIconPicker(categoryId = "new") {
    state.iconTarget = categoryId;
    const category = categoryId === "new"
      ? { name: elements.categoryName.value }
      : state.data.categories.find((entry) => entry.id === categoryId);
    elements.iconSearchInput.value = category?.name || "";
    elements.iconSearchResults.replaceChildren();
    elements.iconSearchStatus.textContent = "Search 10,000+ noun icons by keyword.";
    elements.iconPicker.showModal();
    elements.iconSearchInput.focus();

    if (elements.iconSearchInput.value.trim()) {
      searchIcons();
    }
  }

  function closeIconPicker() {
    elements.iconPicker.close();
  }

  function humanizeIconName(iconName) {
    const name = iconName.split(":").pop() || iconName;
    return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function searchIcons(event) {
    event?.preventDefault();
    const query = elements.iconSearchInput.value.trim();

    if (query.length < 2) {
      elements.iconSearchStatus.textContent = "Enter at least two letters to search.";
      elements.iconSearchResults.replaceChildren();
      return;
    }

    elements.iconSearchStatus.textContent = `Searching icons for “${query}”…`;
    elements.iconSearchResults.replaceChildren();

    try {
      const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=80`);

      if (!response.ok) {
        throw new Error(`Icon search failed with ${response.status}`);
      }

      const result = await response.json();
      const icons = Array.isArray(result.icons) ? result.icons.slice(0, 80) : [];
      elements.iconSearchStatus.textContent = icons.length
        ? `${icons.length} matching icons. Choose one to save it with the category.`
        : "No matching icons found. Try a simpler noun.";

      icons.forEach((iconName) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "icon-result";
        button.dataset.iconName = iconName;
        button.setAttribute("role", "option");
        button.title = humanizeIconName(iconName);

        const image = document.createElement("img");
        image.src = getIconUrl(iconName);
        image.alt = "";

        const label = document.createElement("span");
        label.textContent = humanizeIconName(iconName);
        button.append(image, label);
        elements.iconSearchResults.append(button);
      });
    } catch (error) {
      elements.iconSearchStatus.textContent = "Icon search is unavailable. Check your connection and try again.";
    }
  }

  async function cacheIcon(iconName) {
    const response = await fetch(getIconUrl(iconName));

    if (!response.ok) {
      throw new Error(`Icon download failed with ${response.status}`);
    }

    const svg = await response.text();

    if (!svg.includes("<svg") || svg.length > 100000) {
      throw new Error("Unexpected icon response");
    }

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  async function chooseIcon(iconName) {
    elements.iconSearchStatus.textContent = "Saving icon…";

    try {
      const icon = await cacheIcon(iconName);

      if (state.iconTarget === "new") {
        state.newCategoryIcon = { icon, iconName };
        renderNewCategoryIcon();
      } else {
        state.data.categories = state.data.categories.map((category) => (
          category.id === state.iconTarget ? { ...category, icon, iconName } : category
        ));
        state.data = await Store.saveData(state.data);
        render();
        showStatus("Category icon updated.");
      }

      closeIconPicker();
    } catch (error) {
      elements.iconSearchStatus.textContent = "That icon could not be saved. Try another icon.";
    }
  }

  async function resetSettings() {
    state.data.settings = Store.normalizeSettings({}, state.data.categories);
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Defaults restored.");
  }

  function exportData() {
    const backup = {
      format: "todo-list-cart-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state.data
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `todo-list-cart-backup-${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showStatus("Backup exported.");
  }

  async function importDataFile() {
    const file = elements.importDataFile.files?.[0];

    if (!file) {
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Backup files must be smaller than 5 MB.");
      }

      const parsed = JSON.parse(await file.text());
      const importedData = parsed?.format === "todo-list-cart-backup" ? parsed.data : parsed;
      const hasStoreData = importedData
        && typeof importedData === "object"
        && ["products", "categories", "carts", "orders", "settings"]
          .some((key) => Object.prototype.hasOwnProperty.call(importedData, key));

      if (!hasStoreData) {
        throw new Error("This file is not a ToDoList Cart backup.");
      }

      if (!window.confirm("Import this backup? It will replace the current products, carts, orders, categories, and settings.")) {
        return;
      }

      state.data = await Store.saveData(Store.normalizeData(importedData));
      render();
      showStatus("Backup imported.");
    } catch (error) {
      showStatus(error instanceof Error ? error.message : "The backup could not be imported.");
    } finally {
      elements.importDataFile.value = "";
    }
  }

  function bindEvents() {
    elements.form.addEventListener("submit", saveSettings);
    elements.resetSettings.addEventListener("click", resetSettings);
    elements.exportData.addEventListener("click", exportData);
    elements.importData.addEventListener("click", () => elements.importDataFile.click());
    elements.importDataFile.addEventListener("change", importDataFile);
    elements.addCategory.addEventListener("click", addCategoryFromInput);
    elements.chooseNewCategoryIcon.addEventListener("click", () => openIconPicker("new"));
    elements.categoryName.addEventListener("input", renderNewCategoryIcon);
    elements.categoryList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");

      if (!button) {
        return;
      }

      const item = button.closest(".category-editor");
      const categoryId = item.dataset.categoryId;

      if (button.dataset.action === "choose-icon") {
        openIconPicker(categoryId);
      }

      if (button.dataset.action === "save-category") {
        saveCategoryEdit(categoryId, item.querySelector(".category-name-edit").value);
      }
    });
    elements.categoryList.addEventListener("keydown", (event) => {
      const input = event.target.closest(".category-name-edit");

      if (input && event.key === "Enter") {
        event.preventDefault();
        saveCategoryEdit(input.closest(".category-editor").dataset.categoryId, input.value);
      }
    });
    elements.iconSearchForm.addEventListener("submit", searchIcons);
    elements.closeIconPicker.addEventListener("click", closeIconPicker);
    elements.iconSearchResults.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-icon-name]");

      if (button) {
        chooseIcon(button.dataset.iconName);
      }
    });
    elements.iconPicker.addEventListener("click", (event) => {
      if (event.target === elements.iconPicker) {
        closeIconPicker();
      }
    });
    elements.categoryName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategoryFromInput();
      }
    });

    elements.openHomePage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });

    elements.openProductsPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
    });

    elements.openOrdersPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("order-history.html");
    });

    elements.cartJump.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
  }

  init();
})();
