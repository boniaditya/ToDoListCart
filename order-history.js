(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({})
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    authorPill: document.querySelector(".author-pill"),
    cartCount: document.querySelector("#cart-count"),
    ordersCount: document.querySelector("#orders-count"),
    orderedItemsCount: document.querySelector("#ordered-items-count"),
    lastOrderDate: document.querySelector("#last-order-date"),
    cartSelect: document.querySelector("#cart-select"),
    clearHistory: document.querySelector("#clear-history"),
    orderList: document.querySelector("#order-list"),
    orderTemplate: document.querySelector("#order-template"),
    emptyOrders: document.querySelector("#empty-orders"),
    openHomePage: document.querySelector("#open-home-page"),
    openProductsPage: document.querySelector("#open-products-page"),
    openAccountPage: document.querySelector("#open-account-page"),
    cartJump: document.querySelector("#cart-jump")
  };

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function renderSettings() {
    elements.brandName.textContent = state.data.settings.storeName;
    elements.authorPill.textContent = `by ${state.data.settings.accountName}`;
    document.body.classList.toggle("compact-mode", state.data.settings.compactMode);
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

  function renderSummary() {
    const orders = state.data.orders;
    const itemCount = orders.reduce((count, order) => count + order.items.length, 0);
    const lastOrder = orders[0];

    elements.cartCount.textContent = getActiveCart().items.length;
    elements.ordersCount.textContent = `${orders.length} ${orders.length === 1 ? "order" : "orders"}`;
    elements.orderedItemsCount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
    elements.lastOrderDate.textContent = lastOrder ? Store.formatDate(lastOrder.createdAt) : "No orders yet";
    elements.clearHistory.disabled = orders.length === 0;
  }

  function renderItemImage(item) {
    const box = document.createElement("div");
    box.className = "order-product-image";

    if (item.image && state.data.settings.showImages) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = `${item.title} product image`;
      box.append(image);
      return box;
    }

    box.append(document.createElement("span"));
    return box;
  }

  function renderOrderItem(item) {
    const node = document.createElement("li");
    node.className = "order-product";

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");

    title.textContent = item.title;
    meta.textContent = `${Store.getCategoryLabel(state.data, item.department)} | ${Store.getPriorityLabel(item.priority)} | ${Store.formatMoq(item.moq)} | ${Store.formatMoney(item.price)}`;
    copy.append(title, meta);
    node.append(renderItemImage(item), copy);

    return node;
  }

  function renderOrders() {
    elements.orderList.replaceChildren();

    state.data.orders.forEach((order) => {
      const node = elements.orderTemplate.content.firstElementChild.cloneNode(true);
      const title = node.querySelector(".order-title");
      const date = node.querySelector(".order-date");
      const count = node.querySelector(".order-count");
      const moq = node.querySelector(".order-moq");
      const total = node.querySelector(".order-total");
      const itemList = node.querySelector(".order-items");
      const addButton = node.querySelector(".add-order-button");

      node.dataset.id = order.id;
      title.textContent = order.cartName;
      date.textContent = Store.formatDate(order.createdAt);
      count.textContent = `${order.items.length} ${order.items.length === 1 ? "item" : "items"}`;
      moq.textContent = Store.formatMoq(order.totalMoq);
      total.textContent = Store.formatMoney(order.totalAmount);
      order.items.forEach((item) => itemList.append(renderOrderItem(item)));
      addButton.disabled = order.items.length === 0;

      elements.orderList.append(node);
    });

    elements.emptyOrders.hidden = state.data.orders.length > 0;
  }

  function render() {
    renderSettings();
    renderCartSelector();
    renderSummary();
    renderOrders();
  }

  async function persistAndRender() {
    state.data = await Store.saveData(state.data);
    render();
  }

  async function addOrderToActiveCart(orderId) {
    const order = state.data.orders.find((entry) => entry.id === orderId);

    if (!order) {
      return;
    }

    const activeCart = getActiveCart();
    const existingIds = new Set(activeCart.items.map((item) => item.productId));
    const newItems = [];

    order.items.forEach((orderItem) => {
      let product = state.data.products.find((entry) => entry.id === orderItem.productId);

      if (!product) {
        product = Store.createProduct({
          title: orderItem.title,
          department: orderItem.department,
          priority: orderItem.priority,
          moq: orderItem.moq,
          price: orderItem.price,
          description: orderItem.description,
          image: orderItem.image,
          imageName: orderItem.imageName
        });
        state.data.products.unshift(product);
      }

      if (!existingIds.has(product.id)) {
        existingIds.add(product.id);
        newItems.push({
          id: Store.createId("item"),
          productId: product.id,
          done: false,
          addedAt: Date.now()
        });
      }
    });

    state.data.carts = state.data.carts.map((cart) => (
      cart.id === activeCart.id
        ? { ...cart, items: [...newItems, ...cart.items] }
        : cart
    ));

    await persistAndRender();
  }

  async function clearHistory() {
    state.data.orders = [];
    await persistAndRender();
  }

  function bindEvents() {
    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persistAndRender();
    });

    elements.orderList.addEventListener("click", (event) => {
      const button = event.target.closest(".add-order-button");

      if (button) {
        addOrderToActiveCart(button.closest(".order-card").dataset.id);
      }
    });

    elements.clearHistory.addEventListener("click", clearHistory);

    elements.openHomePage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });

    elements.openProductsPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
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
