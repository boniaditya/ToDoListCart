(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    department: "all",
    query: ""
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    authorPill: document.querySelector(".author-pill"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#search-products"),
    departments: document.querySelector(".departments"),
    productList: document.querySelector("#product-list"),
    productTemplate: document.querySelector("#product-template"),
    emptyProducts: document.querySelector("#empty-products"),
    productCount: document.querySelector("#product-count"),
    visibleCount: document.querySelector("#visible-count"),
    cartCount: document.querySelector("#cart-count"),
    cartSummary: document.querySelector("#cart-summary"),
    cartSelect: document.querySelector("#cart-select"),
    openHomePage: document.querySelector("#open-home-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    openAccountPage: document.querySelector("#open-account-page"),
    cartJump: document.querySelector("#cart-jump")
  };

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function getActiveItems() {
    return getActiveCart().items;
  }

  function cartHasProduct(productId) {
    return getActiveItems().some((item) => item.productId === productId);
  }

  function getCategoryName(product) {
    return Store.getCategoryLabel(state.data, product.department);
  }

  function getVisibleProducts() {
    const query = state.query.toLowerCase();

    return state.data.products.filter((product) => {
      const categoryName = getCategoryName(product);
      const matchesDepartment = state.department === "all" || product.department === state.department;
      const matchesQuery = !query || [
        product.title,
        categoryName,
        product.priority,
        product.description,
        product.moq,
        product.price
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesDepartment && matchesQuery;
    });
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function renderProductImage(container, product) {
    container.replaceChildren();

    if (product.image && state.data.settings.showImages) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = `${product.title} product image`;
      container.append(image);
      return;
    }

    container.append(document.createElement("span"));
  }

  function renderCartSelector() {
    elements.cartSelect.replaceChildren();

    state.data.carts.forEach((cart) => {
      const option = document.createElement("option");
      option.value = cart.id;
      option.textContent = cart.name;
      elements.cartSelect.append(option);
    });

    elements.cartSelect.value = state.data.activeCartId;
  }

  function renderCategoryNav() {
    elements.departments.replaceChildren();

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.dataset.department = "all";
    allButton.textContent = "All";
    elements.departments.append(allButton);

    state.data.categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.department = category.id;
      button.textContent = category.name;
      elements.departments.append(button);
    });

    if (state.department !== "all" && !state.data.categories.some((category) => category.id === state.department)) {
      state.department = "all";
    }

    elements.departments.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.department === state.department;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderSummary() {
    const activeCart = getActiveCart();
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    const cartProducts = activeCart.items
      .map((item) => ({ item, product: productsById.get(item.productId) }))
      .filter((entry) => entry.product);
    const cartCount = cartProducts.length;
    const open = cartProducts.filter((entry) => !entry.item.done).length;
    const total = Store.getTotalAmount(cartProducts.map((entry) => entry.product));

    elements.productCount.textContent = pluralize(state.data.products.length, "product", "products");
    elements.visibleCount.textContent = `${getVisibleProducts().length} shown`;
    elements.cartCount.textContent = cartCount;
    elements.cartSummary.textContent = `${activeCart.name}: ${open} open | ${Store.formatMoney(total)}`;
  }

  function renderProducts() {
    const visibleProducts = getVisibleProducts();
    elements.productList.replaceChildren();

    visibleProducts.forEach((product) => {
      const node = elements.productTemplate.content.firstElementChild.cloneNode(true);
      const imageBox = node.querySelector(".product-image");
      const title = node.querySelector(".product-title");
      const stars = node.querySelector(".rating-stars");
      const priority = node.querySelector(".priority-label");
      const department = node.querySelector(".department-label");
      const moq = node.querySelector(".moq-label");
      const price = node.querySelector(".price-label");
      const addButton = node.querySelector(".add-cart-button");
      const detailButton = node.querySelector(".view-details-button");
      const deleteButton = node.querySelector(".delete-product-button");

      node.dataset.id = product.id;
      renderProductImage(imageBox, product);
      title.textContent = product.title;
      stars.textContent = Store.getStars(product.priority);
      priority.textContent = Store.getPriorityLabel(product.priority);
      department.textContent = getCategoryName(product);
      moq.textContent = Store.formatMoq(product.moq);
      price.textContent = Store.formatMoney(product.price);

      if (cartHasProduct(product.id)) {
        addButton.textContent = "In Cart";
        addButton.classList.add("in-cart");
        addButton.disabled = true;
      }

      detailButton.setAttribute("aria-label", `View details for ${product.title}`);
      deleteButton.setAttribute("aria-label", `Delete ${product.title}`);
      elements.productList.append(node);
    });

    elements.emptyProducts.hidden = visibleProducts.length > 0;
  }

  function render() {
    renderCategoryNav();
    renderSettings();
    renderCartSelector();
    renderProducts();
    renderSummary();
  }

  function renderSettings() {
    elements.brandName.textContent = state.data.settings.storeName;
    elements.authorPill.textContent = `by ${state.data.settings.accountName}`;
    document.body.classList.toggle("compact-mode", state.data.settings.compactMode);
  }

  async function persistAndRender() {
    state.data = await Store.saveData(state.data);
    render();
  }

  async function addToCart(productId) {
    const activeCart = getActiveCart();

    if (activeCart.items.some((item) => item.productId === productId)) {
      return;
    }

    state.data.carts = state.data.carts.map((cart) => (
      cart.id === activeCart.id
        ? {
            ...cart,
            items: [{
              id: Store.createId("item"),
              productId,
              done: false,
              addedAt: Date.now()
            }, ...cart.items]
          }
        : cart
    ));

    await persistAndRender();
  }

  async function deleteProduct(productId) {
    state.data.products = state.data.products.filter((product) => product.id !== productId);
    state.data.carts = state.data.carts.map((cart) => ({
      ...cart,
      items: cart.items.filter((item) => item.productId !== productId)
    }));
    await persistAndRender();
  }

  function openProductDetail(productId) {
    window.location.href = Store.getExtensionUrl(`product.html?id=${encodeURIComponent(productId)}`);
  }

  function setDepartment(department) {
    state.department = department;
    renderCategoryNav();
    renderProducts();
    renderSummary();
  }

  function bindEvents() {
    elements.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      state.query = elements.searchInput.value.trim();
      renderProducts();
      renderSummary();
    });

    elements.searchInput.addEventListener("input", () => {
      state.query = elements.searchInput.value.trim();
      renderProducts();
      renderSummary();
    });

    elements.departments.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-department]");

      if (button) {
        setDepartment(button.dataset.department);
      }
    });

    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persistAndRender();
    });

    elements.productList.addEventListener("click", (event) => {
      const addButton = event.target.closest(".add-cart-button");
      const detailButton = event.target.closest(".view-details-button");
      const deleteButton = event.target.closest(".delete-product-button");

      if (addButton) {
        addToCart(addButton.closest(".product-card").dataset.id);
      }

      if (detailButton) {
        openProductDetail(detailButton.closest(".product-card").dataset.id);
      }

      if (deleteButton) {
        deleteProduct(deleteButton.closest(".product-card").dataset.id);
      }
    });

    elements.openHomePage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });

    elements.openOrdersPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("order-history.html");
    });

    elements.openAccountPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("account.html");
    });

    elements.cartJump.addEventListener("click", () => {
      elements.cartSelect.focus();
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
  }

  init();
})();
