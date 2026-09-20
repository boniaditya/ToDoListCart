(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    department: "all",
    query: "",
    viewMode: localStorage.getItem("todoListCart.productView") === "list" ? "list" : "card"
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#search-products"),
    departments: document.querySelector(".departments"),
    productList: document.querySelector("#product-list"),
    viewButtons: document.querySelectorAll(".view-toggle-button"),
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
        product.location,
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
    const images = product.images || [];

    if (images.length && state.data.settings.showImages) {
      const image = document.createElement("img");
      image.src = images[0].src;
      image.alt = `${product.title} product image 1 of ${images.length}`;
      container.append(image);

      if (images.length > 1) {
        const previous = document.createElement("button");
        const next = document.createElement("button");
        const count = document.createElement("span");

        previous.type = "button";
        previous.className = "carousel-button previous";
        previous.dataset.carouselDirection = "-1";
        previous.setAttribute("aria-label", `Show previous image for ${product.title}`);
        previous.textContent = "‹";

        next.type = "button";
        next.className = "carousel-button next";
        next.dataset.carouselDirection = "1";
        next.setAttribute("aria-label", `Show next image for ${product.title}`);
        next.textContent = "›";

        count.className = "carousel-count";
        count.textContent = `1 / ${images.length}`;
        container.dataset.imageIndex = "0";
        container.append(previous, next, count);
      }

      return;
    }

    container.append(document.createElement("span"));
  }

  function moveCarousel(button) {
    const card = button.closest(".product-card");
    const product = state.data.products.find((entry) => entry.id === card?.dataset.id);
    const container = button.closest(".product-image");
    const images = product?.images || [];

    if (!container || images.length < 2) {
      return;
    }

    const currentIndex = Number(container.dataset.imageIndex || 0);
    const direction = Number(button.dataset.carouselDirection || 1);
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    const image = container.querySelector("img");

    container.dataset.imageIndex = String(nextIndex);
    image.src = images[nextIndex].src;
    image.alt = `${product.title} product image ${nextIndex + 1} of ${images.length}`;
    container.querySelector(".carousel-count").textContent = `${nextIndex + 1} / ${images.length}`;
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
      Store.renderCategory(button, state.data, category.id);
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
      const description = node.querySelector(".product-description");
      const stars = node.querySelector(".rating-stars");
      const priority = node.querySelector(".priority-label");
      const department = node.querySelector(".department-label");
      const location = node.querySelector(".location-label");
      const moq = node.querySelector(".moq-label");
      const price = node.querySelector(".price-label");
      const addButton = node.querySelector(".add-cart-button");
      const detailButton = node.querySelector(".view-details-button");

      node.dataset.id = product.id;
      node.tabIndex = 0;
      node.setAttribute("role", "link");
      node.setAttribute("aria-label", `View details for ${product.title}`);
      renderProductImage(imageBox, product);
      title.textContent = product.title;
      description.textContent = product.description || "No additional details provided.";
      stars.textContent = Store.getStars(product.priority);
      priority.textContent = Store.getPriorityLabel(product.priority);
      Store.renderCategory(department, state.data, product.department);
      location.textContent = product.location;
      moq.textContent = Store.formatMoq(product.moq);
      price.textContent = Store.formatMoney(product.price);

      if (cartHasProduct(product.id)) {
        addButton.textContent = "In Cart";
        addButton.classList.add("in-cart");
        addButton.disabled = true;
      }

      detailButton.setAttribute("aria-label", `View details for ${product.title}`);
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
    renderViewMode();
  }

  function renderViewMode() {
    elements.productList.classList.toggle("list-view", state.viewMode === "list");
    elements.productList.classList.toggle("card-view", state.viewMode === "card");
    elements.viewButtons.forEach((button) => {
      const active = button.dataset.view === state.viewMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setViewMode(viewMode) {
    state.viewMode = viewMode === "list" ? "list" : "card";
    localStorage.setItem("todoListCart.productView", state.viewMode);
    renderViewMode();
  }

  function renderSettings() {
    elements.brandName.textContent = state.data.settings.storeName;
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

    elements.viewButtons.forEach((button) => {
      button.addEventListener("click", () => setViewMode(button.dataset.view));
    });

    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persistAndRender();
    });

    elements.productList.addEventListener("click", (event) => {
      const carouselButton = event.target.closest(".carousel-button");
      const addButton = event.target.closest(".add-cart-button");
      const detailButton = event.target.closest(".view-details-button");

      if (carouselButton) {
        moveCarousel(carouselButton);
        return;
      }

      if (addButton) {
        addToCart(addButton.closest(".product-card").dataset.id);
        return;
      }

      if (detailButton) {
        openProductDetail(detailButton.closest(".product-card").dataset.id);
        return;
      }

      const card = event.target.closest(".product-card");

      if (card) {
        openProductDetail(card.dataset.id);
      }
    });

    elements.productList.addEventListener("keydown", (event) => {
      const card = event.target.closest(".product-card");

      if (card && event.target === card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openProductDetail(card.dataset.id);
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
