(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({})
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    authorPill: document.querySelector(".author-pill"),
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
    resetSettings: document.querySelector("#reset-settings"),
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

  function renderCategoryList() {
    elements.categoryList.replaceChildren();

    state.data.categories.forEach((category) => {
      const item = document.createElement("li");
      item.textContent = category.name;
      elements.categoryList.append(item);
    });
  }

  function renderSettings() {
    const settings = state.data.settings;
    elements.brandName.textContent = settings.storeName;
    elements.authorPill.textContent = `by ${settings.accountName}`;
    renderCategoryOptions();
    renderCategoryList();
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
    const category = existing || Store.createCategory(name, state.data.categories);

    if (!existing) {
      state.data.categories.push(category);
    }

    state.data.settings.defaultDepartment = category.id;
    elements.categoryName.value = "";
    state.data = await Store.saveData(state.data);
    render();
    showStatus(existing ? "Category already exists." : "Category added.");
  }

  async function resetSettings() {
    state.data.settings = Store.normalizeSettings({}, state.data.categories);
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Defaults restored.");
  }

  function bindEvents() {
    elements.form.addEventListener("submit", saveSettings);
    elements.resetSettings.addEventListener("click", resetSettings);
    elements.addCategory.addEventListener("click", addCategoryFromInput);
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
