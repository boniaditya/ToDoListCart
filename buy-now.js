(function () {
  const Store = globalThis.ToDoCartStore;
  const COUPONS = {
    SAVE10: { label: "10% off", type: "percent", value: 10 },
    SAVE5: { label: "5% off", type: "percent", value: 5 },
    TODO100: { label: "Flat 100 off", type: "flat", value: 100 }
  };
  const state = {
    data: Store.normalizeData({}),
    productId: new URLSearchParams(window.location.search).get("id") || "",
    couponCode: ""
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    confirmation: document.querySelector("#buy-now-confirmation"),
    missing: document.querySelector("#missing-buy-now-product"),
    cartCount: document.querySelector("#cart-count"),
    image: document.querySelector("#buy-now-image"),
    title: document.querySelector("#buy-now-product-title"),
    meta: document.querySelector("#buy-now-product-meta"),
    stock: document.querySelector("#buy-now-product-stock"),
    couponInput: document.querySelector("#coupon-code"),
    couponMessage: document.querySelector("#coupon-message"),
    applyCoupon: document.querySelector("#apply-coupon"),
    couponChips: document.querySelectorAll("[data-coupon]"),
    unitPrice: document.querySelector("#summary-unit-price"),
    units: document.querySelector("#summary-units"),
    subtotal: document.querySelector("#summary-subtotal"),
    discount: document.querySelector("#summary-discount"),
    fees: document.querySelector("#summary-fees"),
    total: document.querySelector("#summary-total"),
    time: document.querySelector("#summary-time"),
    confirm: document.querySelector("#confirm-buy-now"),
    cancel: document.querySelector("#cancel-buy-now")
  };

  function getProduct() {
    return state.data.products.find((product) => product.id === state.productId);
  }

  function formatAmount(value) {
    return Store.formatMoney(value, { ...state.data.settings, showTimeEquivalent: false });
  }

  function formatAmountWithTime(value) {
    return Store.formatMoney(value, state.data.settings);
  }

  function getDiscount(subtotal) {
    const coupon = COUPONS[state.couponCode];

    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.min(subtotal, subtotal * (coupon.value / 100));
    return Math.min(subtotal, coupon.value);
  }

  function getSummary() {
    const product = getProduct();
    const subtotal = Number(product?.unitPrice || product?.price || 0);
    const discount = getDiscount(subtotal);
    const fees = 0;
    const total = Math.max(0, subtotal - discount + fees);

    return { subtotal, discount, fees, total };
  }

  function renderProductImage(product) {
    elements.image.replaceChildren();
    const image = product.images?.[0] || (product.image ? { src: product.image, name: product.imageName } : null);

    if (image?.src) {
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = product.title;
      elements.image.append(img);
      return;
    }

    const placeholder = document.createElement("span");
    elements.image.append(placeholder);
  }

  function render() {
    const product = getProduct();
    const activeCart = Store.getActiveCart(state.data);
    const cartCount = activeCart.items.length;

    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = cartCount;

    if (!product) {
      elements.confirmation.hidden = true;
      elements.missing.hidden = false;
      return;
    }

    const unitsInStock = Store.getUnitsInStock(product);
    const coupon = COUPONS[state.couponCode];
    const summary = getSummary();

    document.title = `Confirm ${product.title} - ToDoList Cart`;
    elements.confirmation.hidden = false;
    elements.missing.hidden = true;
    elements.confirm.disabled = !product.inStock;
    renderProductImage(product);
    elements.title.textContent = product.title;
    elements.meta.textContent = [
      Store.getCategoryLabel(state.data, product.department),
      Store.getPriorityLabel(product.priority),
      Store.formatMoq(product.moq),
      `Unit ${formatAmount(product.unitPrice)}`
    ].join(" | ");
    elements.stock.textContent = product.inStock
      ? `${unitsInStock} ${unitsInStock === 1 ? "unit" : "units"} in stock`
      : "Out of stock";
    elements.unitPrice.textContent = formatAmount(product.unitPrice);
    elements.units.textContent = "1";
    elements.subtotal.textContent = formatAmount(summary.subtotal);
    elements.discount.textContent = summary.discount ? `−${formatAmount(summary.discount)}` : formatAmount(0);
    elements.fees.textContent = formatAmount(summary.fees);
    elements.total.textContent = formatAmount(summary.total);
    elements.time.textContent = `Time equivalent: ${formatAmountWithTime(summary.total).split(" · ")[1] || "Not enabled"}`;
    elements.couponMessage.textContent = coupon
      ? `${state.couponCode} applied: ${coupon.label}.`
      : "Optional — apply a coupon before confirming.";
  }

  async function persistAndRender() {
    state.data = await Store.saveData(state.data);
    render();
  }

  function applyCoupon(code) {
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      state.couponCode = "";
      render();
      return;
    }

    if (!COUPONS[normalized]) {
      state.couponCode = "";
      elements.couponMessage.textContent = "Coupon not recognized. Try SAVE10, SAVE5, or TODO100.";
      render();
      elements.couponMessage.textContent = "Coupon not recognized. Try SAVE10, SAVE5, or TODO100.";
      return;
    }

    state.couponCode = normalized;
    elements.couponInput.value = normalized;
    render();
  }

  async function confirmBuyNow() {
    const product = getProduct();

    if (!product?.inStock) return;

    const summary = getSummary();
    const instantCart = {
      id: Store.createId("instant-cart"),
      name: "Buy Now",
      items: [{
        id: Store.createId("item"),
        productId: product.id,
        done: false,
        addedAt: Date.now()
      }]
    };
    const productsById = new Map(state.data.products.map((entry) => [entry.id, entry]));
    const order = Store.createOrder(instantCart, productsById);

    if (!order.items.length) return;

    state.data.orders.unshift({
      ...order,
      cartName: "Buy Now",
      subtotalAmount: summary.subtotal,
      discountAmount: summary.discount,
      couponCode: state.couponCode,
      totalAmount: summary.total
    });
    state.data.products = state.data.products.map((entry) => {
      if (entry.id !== product.id) return entry;
      const completedUnits = Number(entry.completedUnits || 0) + 1;
      return {
        ...entry,
        completedUnits,
        inStock: completedUnits >= Number(entry.availableUnits) ? false : entry.inStock
      };
    });

    await persistAndRender();
    window.location.href = Store.getExtensionUrl("order-history.html");
  }

  function bindEvents() {
    elements.applyCoupon.addEventListener("click", () => applyCoupon(elements.couponInput.value));
    elements.couponInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyCoupon(elements.couponInput.value);
      }
    });
    elements.couponChips.forEach((button) => {
      button.addEventListener("click", () => applyCoupon(button.dataset.coupon));
    });
    elements.confirm.addEventListener("click", confirmBuyNow);
    elements.cancel.addEventListener("click", () => {
      const product = getProduct();
      window.location.href = Store.getExtensionUrl(product ? `product.html?id=${encodeURIComponent(product.id)}` : "newtab.html");
    });
  }

  Store.loadData().then((data) => {
    state.data = data;
    bindEvents();
    render();
  });
})();
