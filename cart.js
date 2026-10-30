(function () {
  const Store = globalThis.ToDoCartStore;
  const state = { data: Store.normalizeData({}) };
  const elements = {
    brandName: document.querySelector(".brand-name"),
    departments: document.querySelector(".departments"),
    cartCount: document.querySelector("#cart-count"),
    cartItemCount: document.querySelector("#cart-item-count"),
    cartOpenCount: document.querySelector("#cart-open-count"),
    cartHeroTotal: document.querySelector("#cart-hero-total"),
    cartManager: document.querySelector(".cart-page-manager"),
    cartSelect: document.querySelector("#cart-select"),
    cartForm: document.querySelector("#cart-form"),
    cartName: document.querySelector("#cart-name"),
    deleteCart: document.querySelector("#delete-cart"),
    cartList: document.querySelector("#cart-list"),
    cartTemplate: document.querySelector("#cart-page-item-template"),
    emptyCart: document.querySelector("#empty-cart"),
    clearDone: document.querySelector("#clear-done"),
    checkoutAll: document.querySelector("#checkout-all"),
    checkoutProgress: document.querySelector("#checkout-progress"),
    checkoutProgressLabel: document.querySelector("#checkout-progress-label"),
    cartPageLayout: document.querySelector(".cart-page-layout"),
    cartProgress: document.querySelector(".cart-page-progress"),
    cartSummary: document.querySelector(".cart-page-summary"),
    cartSummaryList: document.querySelector(".cart-summary-list"),
    progressLabel: document.querySelector("#progress-label"),
    progressBar: document.querySelector("#progress-bar"),
    summaryProducts: document.querySelector("#summary-products"),
    summaryMoq: document.querySelector("#summary-moq"),
    summaryOpen: document.querySelector("#summary-open"),
    summaryTotal: document.querySelector("#summary-total"),
    summaryTimeRow: document.querySelector("#summary-time-row"),
    summaryTime: document.querySelector("#summary-time"),
    summarySelectedItems: document.querySelector("#summary-selected-items"),
    summarySelectedEmpty: document.querySelector("#summary-selected-empty"),
    selectionProgress: document.querySelector("#cart-selection-progress"),
    status: document.querySelector("#cart-status")
  };

  const getActiveCart = () => Store.getActiveCart(state.data);
  const getProductMap = () => new Map(state.data.products.map((product) => [product.id, product]));
  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;
  const formatCartDuration = (duration) => {
    const trimmed = String(duration || "").replace(/\s*\d+s$/, "").trim();
    return trimmed || (duration ? "less than 1m" : "");
  };

  function getCartEntries() {
    const productsById = getProductMap();
    return getActiveCart().items
      .map((item) => ({ item, product: productsById.get(item.productId) }))
      .filter((entry) => entry.product);
  }

  function setActiveCart(nextCart) {
    state.data.carts = state.data.carts.map((cart) => cart.id === nextCart.id ? nextCart : cart);
  }

  async function persist(message = "") {
    state.data = await Store.saveData(state.data);
    render();
    elements.status.textContent = message;
  }

  function renderCategories() {
    elements.departments.replaceChildren();
    const all = document.createElement("a");
    all.href = "newtab.html";
    all.className = "active";
    all.textContent = "All";
    elements.departments.append(all);
    state.data.categories.forEach((category) => {
      const link = document.createElement("a");
      link.href = `newtab.html?department=${encodeURIComponent(category.id)}`;
      Store.renderCategory(link, state.data, category.id);
      elements.departments.append(link);
    });
    Store.appendCategoryCreateButton(elements.departments);
  }

  function renderCartSelector() {
    elements.cartSelect.replaceChildren();
    state.data.carts.forEach((cart) => {
      const option = document.createElement("option");
      option.value = cart.id;
      option.textContent = `${cart.name} (${cart.items.length})`;
      elements.cartSelect.append(option);
    });
    elements.cartSelect.value = state.data.activeCartId;
    elements.deleteCart.disabled = state.data.carts.length <= 1;
  }

  function renderItem({ item, product }) {
    const node = elements.cartTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector("input[type='checkbox']");
    const imageLink = node.querySelector(".cart-page-product-image");
    const title = node.querySelector(".cart-page-product-title");
    const description = node.querySelector(".cart-page-description");
    const department = node.querySelector(".department-label");
    const location = node.querySelector(".location-label");
    const moq = node.querySelector(".moq-label");
    const stock = node.querySelector(".cart-stock");
    const price = node.querySelector(".cart-item-price");
    const time = node.querySelector(".cart-item-time");
    const remove = node.querySelector(".remove-cart-button");
    const moveWishlist = node.querySelector(".move-wishlist-button");
    const detailUrl = `product.html?id=${encodeURIComponent(product.id)}`;
    const [money, duration] = Store.formatMoney(product.price, state.data.settings).split(" · ");
    const imageSource = product.images?.[0]?.cardSrc || product.images?.[0]?.src || product.image;

    node.dataset.productId = product.id;
    node.classList.toggle("done", item.done);
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", `Mark ${product.title} as ${item.done ? "open" : "checked"}`);
    imageLink.href = detailUrl;
    imageLink.replaceChildren();
    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `${product.title} product image`;
      imageLink.append(image);
    } else {
      imageLink.append(document.createElement("span"));
    }
    title.href = detailUrl;
    title.textContent = product.title;
    description.textContent = product.description || "No additional details provided.";
    description.hidden = !state.data.settings.cartPageShowDescriptions;
    Store.renderCategory(department, state.data, product.department);
    location.textContent = product.location;
    moq.textContent = Store.formatMoq(product.moq);
    const units = Store.getUnitsInStock(product);
    stock.textContent = `${units} ${units === 1 ? "unit" : "units"} in stock`;
    stock.hidden = !state.data.settings.cartPageShowStock;
    stock.classList.toggle("out-of-stock", units === 0);
    price.textContent = `Total ${money}`;
    time.textContent = formatCartDuration(duration);
    time.hidden = !duration;
    remove.setAttribute("aria-label", `Remove ${product.title} from cart`);
    moveWishlist.setAttribute("aria-label", `Move ${product.title} from cart to wishlist`);
    imageLink.hidden = !state.data.settings.cartPageShowImages;
    remove.hidden = !state.data.settings.cartPageShowRemoveButtons;
    return node;
  }

  function render() {
    const activeCart = getActiveCart();
    const entries = getCartEntries();
    const products = entries.map((entry) => entry.product);
    const selectedEntries = entries.filter((entry) => entry.item.done);
    const selectedProducts = selectedEntries.map((entry) => entry.product);
    const done = entries.filter((entry) => entry.item.done).length;
    const open = entries.length - done;
    const progress = entries.length ? Math.round((done / entries.length) * 100) : 0;
    const total = Store.getTotalAmount(products);
    const selectedTotal = Store.getTotalAmount(selectedProducts);
    const selectedMoq = Store.getTotalMoq(selectedProducts);
    const [money, duration] = Store.formatMoney(total, state.data.settings).split(" · ");
    const [selectedMoney, selectedDuration] = Store.formatMoney(selectedTotal, state.data.settings).split(" · ");

    elements.brandName.textContent = state.data.settings.storeName;
    Store.renderHeaderCommentBadges(state.data);
    elements.cartManager.hidden = !state.data.settings.cartPageShowManager;
    elements.cartPageLayout.classList.toggle("sticky-checkout-compact", state.data.settings.stickyCheckoutCompact);
    elements.cartPageLayout.classList.toggle("hide-cart-images", !state.data.settings.cartPageShowImages);
    elements.cartPageLayout.classList.toggle("hide-cart-remove-buttons", !state.data.settings.cartPageShowRemoveButtons);
    elements.cartProgress.hidden = !state.data.settings.cartPageShowProgress;
    elements.cartSummary.classList.toggle("is-compact", state.data.settings.stickyCheckoutCompact);
    elements.cartSummaryList.hidden = !state.data.settings.stickyCheckoutShowSummary;
    document.querySelector("#cart-page-title").textContent = activeCart.name;
    renderCategories();
    renderCartSelector();
    elements.cartList.replaceChildren(...entries.map(renderItem));
    elements.emptyCart.hidden = entries.length > 0;
    elements.clearDone.hidden = entries.length === 0;
    elements.clearDone.disabled = done === 0;
    elements.checkoutAll.disabled = done === 0;
    elements.cartCount.textContent = String(entries.length);
    elements.cartItemCount.textContent = plural(entries.length, "item");
    elements.cartOpenCount.textContent = `${open} open`;
    elements.cartHeroTotal.textContent = money;
    elements.progressLabel.textContent = `${progress}%`;
    elements.progressBar.style.width = `${progress}%`;
    elements.summaryProducts.textContent = String(selectedEntries.length);
    elements.summaryMoq.textContent = String(selectedMoq);
    elements.summaryOpen.textContent = String(open);
    elements.summaryTotal.textContent = selectedMoney;
    elements.summaryTime.textContent = formatCartDuration(selectedDuration);
    elements.summaryTimeRow.hidden = !selectedDuration;
    elements.summarySelectedItems.replaceChildren(...selectedEntries.map(({ product }) => {
      const item = document.createElement("li");
      item.textContent = product.title;
      return item;
    }));
    elements.summarySelectedItems.hidden = selectedEntries.length === 0;
    elements.summarySelectedEmpty.hidden = selectedEntries.length > 0;
  }

  async function toggleDone(productId, done) {
    const activeCart = getActiveCart();
    const currentItem = activeCart.items.find((item) => item.productId === productId);
    if (!currentItem || currentItem.done === done) return;
    setActiveCart({
      ...activeCart,
      items: activeCart.items.map((item) => item.productId === productId ? { ...item, done } : item)
    });
    state.data.products = state.data.products.map((product) => {
      if (product.id !== productId) return product;
      const completedUnits = Math.max(0, Number(product.completedUnits || 0) + (done ? 1 : -1));
      return { ...product, completedUnits, inStock: completedUnits < Number(product.availableUnits) };
    });
    elements.selectionProgress.hidden = false;
    elements.cartList.setAttribute("aria-busy", "true");
    try {
      await persist();
    } finally {
      elements.selectionProgress.hidden = true;
      elements.cartList.removeAttribute("aria-busy");
    }
  }

  async function removeItem(productId) {
    const product = state.data.products.find((entry) => entry.id === productId);
    const title = product?.title || "this item";

    if (!window.confirm(`Remove ${title} from the cart?`)) {
      return;
    }

    const activeCart = getActiveCart();
    setActiveCart({ ...activeCart, items: activeCart.items.filter((item) => item.productId !== productId) });
    await persist("Item removed from cart.");
  }

  function setMoveWishlistProgress(button, isMoving) {
    if (!button) return;
    button.disabled = isMoving;
    button.classList.toggle("is-moving", isMoving);
    button.setAttribute("aria-busy", String(isMoving));
    button.textContent = isMoving ? "Moving..." : "Move to wishlist";
  }

  async function moveItemToWishlist(productId, button) {
    setMoveWishlistProgress(button, true);
    const activeCart = getActiveCart();
    setActiveCart({ ...activeCart, items: activeCart.items.filter((item) => item.productId !== productId) });
    state.data.wishlist = [...new Set([...(state.data.wishlist || []), productId])];
    try {
      await persist("Item moved to wishlist.");
    } catch (error) {
      setMoveWishlistProgress(button, false);
      throw error;
    }
  }

  async function clearDone() {
    const activeCart = getActiveCart();
    setActiveCart({ ...activeCart, items: activeCart.items.filter((item) => !item.done) });
    await persist("Checked items cleared.");
  }

  async function checkout() {
    const activeCart = getActiveCart();
    const productsById = getProductMap();
    const checkedItems = activeCart.items.filter((item) => item.done);
    if (!checkedItems.length) {
      elements.status.textContent = "Check at least one item before checkout.";
      return;
    }

    elements.checkoutAll.disabled = true;
    elements.checkoutProgress.hidden = false;
    elements.checkoutProgressLabel.textContent = "Preparing your order...";
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const checkoutCart = { ...activeCart, items: checkedItems };
    const order = Store.createOrder(checkoutCart, productsById);
    if (!order.items.length) {
      elements.checkoutProgress.hidden = true;
      elements.checkoutAll.disabled = false;
      return;
    }
    elements.checkoutProgressLabel.textContent = "Creating your order...";
    state.data.orders.unshift(order);
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => !item.done)
    });
    elements.checkoutProgressLabel.textContent = "Updating your cart...";
    await persist("Checkout complete. Your order was added to order history.");
    elements.checkoutProgress.hidden = true;
  }

  async function createCart(event) {
    event.preventDefault();
    const name = elements.cartName.value.trim();
    if (!name) return;
    const cart = Store.createCart(name);
    state.data.carts.push(cart);
    state.data.activeCartId = cart.id;
    elements.cartName.value = "";
    await persist("Cart created.");
  }

  async function deleteCart() {
    if (state.data.carts.length <= 1) return;
    state.data.carts = state.data.carts.filter((cart) => cart.id !== state.data.activeCartId);
    state.data.activeCartId = state.data.carts[0].id;
    await persist("Cart deleted.");
  }

  function bindEvents() {
    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persist();
    });
    elements.cartForm.addEventListener("submit", createCart);
    elements.deleteCart.addEventListener("click", deleteCart);
    elements.clearDone.addEventListener("click", clearDone);
    elements.checkoutAll.addEventListener("click", checkout);
    elements.cartList.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[type='checkbox']");
      if (checkbox) toggleDone(checkbox.closest(".cart-page-item").dataset.productId, checkbox.checked);
    });
    elements.cartList.addEventListener("click", (event) => {
      const moveWishlist = event.target.closest(".move-wishlist-button");
      if (moveWishlist) {
        moveItemToWishlist(moveWishlist.closest(".cart-page-item").dataset.productId, moveWishlist);
        return;
      }

      const remove = event.target.closest(".remove-cart-button");
      if (remove) removeItem(remove.closest(".cart-page-item").dataset.productId);
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
    const skeleton = document.querySelector("#cart-data-skeleton");
    skeleton?.classList.add("is-ready");
    window.setTimeout(() => skeleton?.remove(), 260);
    Store.watchDataChanges(async () => {
      state.data = await Store.loadData();
      render();
    });
  }

  init();
})();
