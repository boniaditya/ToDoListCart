(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    productId: new URLSearchParams(window.location.search).get("id")
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    authorPill: document.querySelector(".author-pill"),
    productDetail: document.querySelector("#product-detail"),
    missingProduct: document.querySelector("#missing-product"),
    missingProductsLink: document.querySelector("#missing-products-link"),
    detailImage: document.querySelector("#detail-image"),
    title: document.querySelector("#detail-title"),
    stars: document.querySelector("#detail-stars"),
    priority: document.querySelector("#detail-priority"),
    department: document.querySelector("#detail-department"),
    moq: document.querySelector("#detail-moq"),
    price: document.querySelector("#detail-price"),
    created: document.querySelector("#detail-created"),
    description: document.querySelector("#detail-description"),
    cartSelect: document.querySelector("#cart-select"),
    cartCount: document.querySelector("#cart-count"),
    cartStatus: document.querySelector("#detail-cart-status"),
    addCart: document.querySelector("#detail-add-cart"),
    removeCart: document.querySelector("#detail-remove-cart"),
    done: document.querySelector("#detail-done"),
    deleteProduct: document.querySelector("#detail-delete"),
    openProductsPage: document.querySelector("#open-products-page"),
    openHomePage: document.querySelector("#open-home-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    openAccountPage: document.querySelector("#open-account-page")
  };

  function getProduct() {
    return state.data.products.find((product) => product.id === state.productId);
  }

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function getActiveItem() {
    return getActiveCart().items.find((item) => item.productId === state.productId);
  }

  function setActiveCart(nextCart) {
    state.data.carts = state.data.carts.map((cart) => (
      cart.id === nextCart.id ? nextCart : cart
    ));
  }

  function renderProductImage(product) {
    elements.detailImage.replaceChildren();

    if (product.image && state.data.settings.showImages) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = `${product.title} product image`;
      elements.detailImage.append(image);
      return;
    }

    elements.detailImage.append(document.createElement("span"));
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

  function renderMissing() {
    elements.productDetail.hidden = true;
    elements.missingProduct.hidden = false;
  }

  function render() {
    const product = getProduct();

    renderSettings();

    if (!product) {
      renderMissing();
      return;
    }

    const activeCart = getActiveCart();
    const activeItem = getActiveItem();
    const cartCount = activeCart.items.length;

    document.title = `${product.title} - ToDoList Cart`;
    elements.productDetail.hidden = false;
    elements.missingProduct.hidden = true;
    renderProductImage(product);
    renderCartSelector();

    elements.title.textContent = product.title;
    elements.stars.textContent = Store.getStars(product.priority);
    elements.priority.textContent = Store.getPriorityLabel(product.priority);
    elements.department.textContent = Store.getCategoryLabel(state.data, product.department);
    elements.moq.textContent = Store.formatMoq(product.moq);
    elements.price.textContent = Store.formatMoney(product.price);
    elements.created.textContent = Store.formatDate(product.createdAt);
    elements.description.textContent = product.description || "No description added yet.";
    elements.cartCount.textContent = cartCount;
    elements.cartStatus.textContent = activeItem
      ? `In ${activeCart.name}${activeItem.done ? " and checked out" : ""}`
      : `Not in ${activeCart.name}`;
    elements.addCart.disabled = Boolean(activeItem);
    elements.removeCart.disabled = !activeItem;
    elements.done.disabled = !activeItem;
    elements.done.checked = Boolean(activeItem?.done);
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

  async function addToCart() {
    const activeCart = getActiveCart();

    if (getActiveItem()) {
      return;
    }

    setActiveCart({
      ...activeCart,
      items: [{
        id: Store.createId("item"),
        productId: state.productId,
        done: false,
        addedAt: Date.now()
      }, ...activeCart.items]
    });

    await persistAndRender();
  }

  async function removeFromCart() {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => item.productId !== state.productId)
    });
    await persistAndRender();
  }

  async function toggleDone(done) {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.map((item) => (
        item.productId === state.productId ? { ...item, done } : item
      ))
    });
    await persistAndRender();
  }

  async function deleteProduct() {
    state.data.products = state.data.products.filter((product) => product.id !== state.productId);
    state.data.carts = state.data.carts.map((cart) => ({
      ...cart,
      items: cart.items.filter((item) => item.productId !== state.productId)
    }));
    await Store.saveData(state.data);
    window.location.href = Store.getExtensionUrl("products.html");
  }

  function bindEvents() {
    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persistAndRender();
    });

    elements.addCart.addEventListener("click", addToCart);
    elements.removeCart.addEventListener("click", removeFromCart);
    elements.done.addEventListener("change", () => toggleDone(elements.done.checked));
    elements.deleteProduct.addEventListener("click", deleteProduct);

    elements.openProductsPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
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

    elements.missingProductsLink.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
  }

  init();
})();
