(function () {
  const Store = globalThis.ToDoCartStore;
  const state = { data: Store.normalizeData({}) };
  const elements = {
    brandName: document.querySelector(".brand-name"),
    cartCount: document.querySelector("#cart-count"),
    orderCount: document.querySelector("#tally-order-count"),
    openItems: document.querySelector("#tally-open-items"),
    productCount: document.querySelector("#tally-product-count"),
    spent: document.querySelector("#tally-spent"),
    openValue: document.querySelector("#tally-open-value"),
    inventoryValue: document.querySelector("#tally-inventory-value"),
    catalogValue: document.querySelector("#tally-catalog-value"),
    archivedValue: document.querySelector("#tally-archived-value"),
    wishlistValue: document.querySelector("#tally-wishlist-value"),
    wishlistCount: document.querySelector("#tally-wishlist-count"),
    completionSummary: document.querySelector("#completion-summary"),
    completionTotalValue: document.querySelector("#completion-total-value"),
    completionRing: document.querySelector("#completion-ring"),
    completionPercent: document.querySelector("#completion-percent"),
    completionPercentLabel: document.querySelector("#completion-percent-label"),
    completionCards: document.querySelectorAll("[data-completion-focus]"),
    completionSpentValue: document.querySelector("#completion-spent-value"),
    completionSpentPercent: document.querySelector("#completion-spent-percent"),
    completionOpenValue: document.querySelector("#completion-open-value"),
    completionOpenPercent: document.querySelector("#completion-open-percent"),
    completionStockValue: document.querySelector("#completion-stock-value"),
    completionStockPercent: document.querySelector("#completion-stock-percent"),
    valueChart: document.querySelector("#value-chart"),
    categoryChart: document.querySelector("#category-chart"),
    cartChart: document.querySelector("#cart-chart"),
    categoryList: document.querySelector("#category-tally-list"),
    emptyCategories: document.querySelector("#empty-category-tally"),
  };

  const productValue = (product) => Number(product.price || 0);
  const money = (value) => Store.formatMoney(value, state.data.settings);
  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;
  const chartColors = ["#9ad9e3", "#ffd28a", "#a8ddb5", "#f4b79f", "#c7d2e5", "#c9b6f2", "#f7b7a3", "#9fd8cf"];
  const moneyAmount = (value) => money(value).split(" · ")[0];
  let categoryTooltip;

  function getCategoryTooltip() {
    if (!categoryTooltip) {
      categoryTooltip = document.createElement("div");
      categoryTooltip.className = "category-floating-tooltip";
      categoryTooltip.hidden = true;
      document.body.append(categoryTooltip);
    }
    return categoryTooltip;
  }

  function showCategoryTooltip(text, event) {
    const tooltip = getCategoryTooltip();
    tooltip.textContent = text;
    tooltip.hidden = false;
    moveCategoryTooltip(event);
  }

  function moveCategoryTooltip(event) {
    if (!categoryTooltip || categoryTooltip.hidden || !event) return;
    const gap = 16;
    const width = categoryTooltip.offsetWidth || 240;
    const height = categoryTooltip.offsetHeight || 48;
    const left = Math.min(window.innerWidth - width - 12, Math.max(12, event.clientX - width / 2));
    const top = Math.max(12, event.clientY - height - gap);
    categoryTooltip.style.left = `${left}px`;
    categoryTooltip.style.top = `${top}px`;
  }

  function hideCategoryTooltip() {
    if (categoryTooltip) {
      categoryTooltip.hidden = true;
    }
  }

  function setCompletionFocus(focus = "complete") {
    const mix = state.completionMix;
    if (!mix) return;
    const selected = mix[focus] || mix.complete;

    elements.completionPercent.textContent = percentLabel(selected.percent);
    elements.completionPercentLabel.textContent = selected.label;
    elements.completionRing.dataset.focus = selected.key;
    elements.completionCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.completionFocus === selected.key);
    });
  }

  function getCompletionFocusFromPointer(event) {
    const mix = state.completionMix;
    if (!mix) return "complete";
    const rect = elements.completionRing.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const distance = Math.sqrt((x * x) + (y * y));
    const innerRadius = rect.width * 0.24;

    if (distance < innerRadius) {
      return elements.completionRing.dataset.focus || "complete";
    }

    const angle = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
    const pointerPercent = (angle / 360) * 100;
    if (pointerPercent <= mix.complete.stop) return "complete";
    if (pointerPercent <= mix.cart.stop) return "cart";
    return "stock";
  }
  const percentLabel = (value) => `${value.toFixed(value >= 10 || value === 0 ? 0 : 1)}%`;

  function renderStatValue(element, value) {
    const [price, duration] = money(value).split(" · ");
    const priceLine = document.createElement("span");
    priceLine.className = "tally-stat-price";
    priceLine.textContent = price;
    element.replaceChildren(priceLine);

    if (duration) {
      const timeLine = document.createElement("span");
      const timeIcon = document.createElement("span");
      const timeText = document.createElement("span");
      timeLine.className = "tally-stat-time";
      timeIcon.className = "tally-stat-time-icon";
      timeIcon.setAttribute("aria-hidden", "true");
      timeText.textContent = duration;
      timeLine.append(timeIcon, timeText);
      element.append(timeLine);
    }
  }

  function createTallyItem(title, meta, value) {
    const item = document.createElement("li");
    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    const detail = document.createElement("span");
    const amount = document.createElement("b");
    heading.textContent = title;
    detail.textContent = meta;
    amount.textContent = money(value);
    copy.append(heading, detail);
    item.append(copy, amount);
    return item;
  }

  function renderVerticalCategoryChart(container, entries) {
    container.replaceChildren();
    const visibleEntries = entries.filter((entry) => Number(entry.total) > 0);
    const values = visibleEntries.map((entry) => Number(entry.total));
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values.filter((value) => value > 0), maxValue);

    if (!visibleEntries.length) {
      return;
    }

    visibleEntries.forEach((entry, index) => {
      const item = document.createElement("li");
      const value = document.createElement("b");
      const barWrap = document.createElement("div");
      const stack = document.createElement("div");
      const label = document.createElement("a");
      const detail = document.createElement("span");
      const footer = document.createElement("small");
      const normalized = maxValue > minValue
        ? ((Number(entry.total) - minValue) / (maxValue - minValue)) * 72 + 28
        : 100;
      const completedPercent = entry.total ? (entry.completed / entry.total) * 100 : 0;
      const cartPercent = entry.total ? (entry.inCart / entry.total) * 100 : 0;
      const storePercent = Math.max(0, 100 - completedPercent - cartPercent);
      const defaultDetail = `Done ${moneyAmount(entry.completed)} · Cart ${moneyAmount(entry.inCart)} · Store ${moneyAmount(entry.inStore)}`;
      const tooltip = `${entry.label}: ${moneyAmount(entry.total)} total · ${moneyAmount(entry.completed)} completed · ${moneyAmount(entry.inCart)} in cart · ${moneyAmount(entry.inStore)} in store`;
      const segmentDetails = {
        complete: `Completed: ${money(entry.completed)} · ${percentLabel(completedPercent)} of ${entry.label}`,
        cart: `In cart: ${money(entry.inCart)} · ${percentLabel(cartPercent)} of ${entry.label}`,
        store: `In store: ${money(entry.inStore)} · ${percentLabel(storePercent)} of ${entry.label}`
      };

      item.className = "category-column-item";
      item.setAttribute("aria-label", tooltip);
      item.style.setProperty("--bar-color", chartColors[index % chartColors.length]);
      value.textContent = moneyAmount(entry.total);
      barWrap.className = "category-column-bar";
      stack.className = "category-column-stack";
      stack.style.height = `${Math.max(28, normalized)}%`;
      [
        ["complete", completedPercent, entry.completed],
        ["cart", cartPercent, entry.inCart],
        ["store", storePercent, entry.inStore]
      ].forEach(([className, percent, amount]) => {
        if (amount <= 0 || percent <= 0) {
          return;
        }
        const slice = document.createElement("i");
        const segmentDetail = segmentDetails[className];
        slice.className = className;
        slice.style.height = `${Math.max(8, percent)}%`;
        slice.tabIndex = 0;
        slice.dataset.detail = segmentDetail;
        slice.setAttribute("aria-label", segmentDetail);
        slice.addEventListener("mouseenter", (event) => {
          footer.textContent = segmentDetail;
          showCategoryTooltip(segmentDetail, event);
        });
        slice.addEventListener("mousemove", moveCategoryTooltip);
        slice.addEventListener("focus", (event) => {
          footer.textContent = segmentDetail;
          showCategoryTooltip(segmentDetail, event);
        });
        slice.addEventListener("mouseleave", () => {
          footer.textContent = defaultDetail;
          hideCategoryTooltip();
        });
        slice.addEventListener("blur", () => {
          footer.textContent = defaultDetail;
          hideCategoryTooltip();
        });
        stack.append(slice);
      });
      label.className = "category-column-link";
      label.href = `products.html?department=${encodeURIComponent(entry.id)}`;
      label.setAttribute("aria-label", `View ${entry.label} products`);
      label.textContent = entry.label;
      detail.textContent = plural(entry.products, "product");
      footer.textContent = defaultDetail;
      barWrap.append(stack);
      item.append(value, barWrap, label, detail, footer);
      container.append(item);
    });
  }

  function renderBarChart(container, entries, options = {}) {
    container.replaceChildren();
    const visibleEntries = entries.filter((entry) => Number(entry.value) > 0);
    const maxValue = Math.max(...visibleEntries.map((entry) => entry.value), 0);
    const colors = options.colors || [options.color || "#9ad9e3"];

    if (!visibleEntries.length) {
      const empty = document.createElement("p");
      empty.className = "tally-empty";
      empty.textContent = "No values to chart yet.";
      container.append(empty);
      return;
    }

    visibleEntries.forEach((entry, index) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const track = document.createElement("div");
      const bar = document.createElement("i");
      const value = document.createElement("b");
      const width = maxValue ? Math.max(4, Math.round((entry.value / maxValue) * 100)) : 0;

      row.className = "analytics-bar-row";
      label.textContent = entry.label;
      track.className = "analytics-bar-track";
      bar.style.background = colors[index % colors.length];
      bar.style.width = `${width}%`;
      value.textContent = money(entry.value).split(" · ")[0];
      track.append(bar);
      row.append(label, track, value);
      container.append(row);
    });
  }

  function renderCompletionSpotlight(spent, openValue, inventoryValue) {
    const remainingStoreValue = Math.max(0, inventoryValue - openValue);
    const totalCommitment = spent + openValue + remainingStoreValue;
    const spentPercent = totalCommitment ? (spent / totalCommitment) * 100 : 0;
    const openPercent = totalCommitment ? (openValue / totalCommitment) * 100 : 0;
    const remainingPercent = totalCommitment ? (remainingStoreValue / totalCommitment) * 100 : 0;
    const completedStop = Math.min(100, Math.max(0, spentPercent));
    const cartStop = Math.min(100, Math.max(completedStop, spentPercent + openPercent));

    state.completionMix = {
      complete: {
        key: "complete",
        label: "complete",
        percent: spentPercent,
        stop: completedStop
      },
      cart: {
        key: "cart",
        label: "in cart",
        percent: openPercent,
        stop: cartStop
      },
      stock: {
        key: "stock",
        label: "pending",
        percent: remainingPercent,
        stop: 100
      }
    };

    elements.completionTotalValue.textContent = money(totalCommitment);
    elements.completionSpentValue.textContent = money(spent);
    elements.completionSpentPercent.textContent = `${percentLabel(spentPercent)} of total`;
    elements.completionOpenValue.textContent = money(openValue);
    elements.completionOpenPercent.textContent = `${percentLabel(openPercent)} of total`;
    elements.completionStockValue.textContent = money(remainingStoreValue);
    elements.completionStockPercent.textContent = `${percentLabel(remainingPercent)} of total`;
    elements.completionRing.style.setProperty("--completed-stop", `${completedStop}%`);
    elements.completionRing.style.setProperty("--cart-stop", `${cartStop}%`);
    setCompletionFocus(elements.completionRing.dataset.focus || "complete");

    if (totalCommitment > 0) {
      elements.completionSummary.textContent = `${moneyAmount(spent)} is complete, ${moneyAmount(openValue)} is in carts, and ${moneyAmount(remainingStoreValue)} remains as pending stock.`;
      return;
    }

    elements.completionSummary.textContent = "Completed, cart, and pending stock value will appear here after priced products are added.";
  }

  function bindCompletionInteractions() {
    elements.completionRing.addEventListener("mousemove", (event) => {
      setCompletionFocus(getCompletionFocusFromPointer(event));
    });
    elements.completionRing.addEventListener("mouseleave", () => {
      setCompletionFocus("complete");
    });
    elements.completionCards.forEach((card) => {
      const focus = card.dataset.completionFocus;
      card.addEventListener("mouseenter", () => setCompletionFocus(focus));
      card.addEventListener("focus", () => setCompletionFocus(focus));
      card.addEventListener("mouseleave", () => setCompletionFocus("complete"));
      card.addEventListener("blur", () => setCompletionFocus("complete"));
    });
  }

  function renderCartCompositionChart(container, carts) {
    container.replaceChildren();
    const cartsWithItems = carts.filter((cart) => cart.items.length);

    if (!cartsWithItems.length) {
      const empty = document.createElement("p");
      empty.className = "tally-empty";
      empty.textContent = "No open cart items to compare yet.";
      container.append(empty);
      return;
    }

    cartsWithItems.forEach((cart) => {
      const section = document.createElement("article");
      const header = document.createElement("div");
      const title = document.createElement("strong");
      const total = document.createElement("b");
      const stack = document.createElement("div");
      const items = document.createElement("div");

      section.className = "cart-composition";
      header.className = "cart-composition-header";
      title.textContent = `${cart.name} · ${plural(cart.items.length, "open item")}`;
      total.textContent = money(cart.value).split(" · ")[0];
      stack.className = "cart-composition-stack";
      items.className = "cart-composition-items";
      header.append(title, total);

      cart.items.forEach((entry, index) => {
        const percent = cart.value ? (entry.value / cart.value) * 100 : 0;
        const color = chartColors[index % chartColors.length];
        const tooltip = `${entry.title}: ${money(entry.value).split(" · ")[0]} (${percent.toFixed(1)}% of ${cart.name})`;
        const slice = document.createElement("span");
        const item = document.createElement("a");
        const swatch = document.createElement("span");
        const label = document.createElement("strong");
        const detail = document.createElement("em");

        slice.style.width = `${Math.max(2, percent)}%`;
        slice.style.background = color;
        slice.title = tooltip;
        slice.setAttribute("aria-label", tooltip);

        item.className = "cart-composition-item";
        item.href = `product.html?id=${encodeURIComponent(entry.id)}`;
        item.title = tooltip;
        item.setAttribute("aria-label", `Open ${entry.title}`);
        swatch.className = "analytics-pie-swatch";
        swatch.style.background = color;
        label.textContent = entry.title;
        detail.textContent = `${money(entry.value).split(" · ")[0]} · ${percent.toFixed(1)}%`;
        item.append(swatch, label, detail);
        stack.append(slice);
        items.append(item);
      });

      section.append(header, stack, items);
      container.append(section);
    });
  }

  function render() {
    const activeProducts = state.data.products.filter((product) => !product.archived);
    const archivedProducts = state.data.products.filter((product) => product.archived);
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    const orders = state.data.orders;
    const spent = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    const openCartEntries = state.data.carts.flatMap((cart) => cart.items
      .filter((item) => !item.done)
      .map((item) => ({ cart, item, product: productsById.get(item.productId) }))
      .filter((entry) => entry.product));
    const openValue = openCartEntries.reduce((total, entry) => total + productValue(entry.product), 0);
    const inventoryValue = activeProducts.reduce((total, product) => (
      total + (Store.getUnitsInStock(product) > 0 ? productValue(product) : 0)
    ), 0);
    const catalogValue = activeProducts.reduce((total, product) => total + productValue(product), 0);
    const archivedValue = archivedProducts.reduce((total, product) => total + productValue(product), 0);
    const wishlistProducts = state.data.wishlist.map((id) => productsById.get(id)).filter(Boolean);
    const wishlistValue = wishlistProducts.reduce((total, product) => total + productValue(product), 0);
    const activeCart = Store.getActiveCart(state.data);

    elements.brandName.textContent = state.data.settings.storeName;
    Store.renderHeaderCommentBadges(state.data);
    elements.cartCount.textContent = activeCart.items.length;
    elements.orderCount.textContent = plural(orders.length, "order");
    elements.openItems.textContent = plural(openCartEntries.length, "open cart item");
    elements.productCount.textContent = `${activeProducts.length} products · ${archivedProducts.length} archived`;
    renderStatValue(elements.spent, spent);
    renderStatValue(elements.openValue, openValue);
    renderStatValue(elements.inventoryValue, inventoryValue);
    renderStatValue(elements.catalogValue, catalogValue);
    renderStatValue(elements.archivedValue, archivedValue);
    renderStatValue(elements.wishlistValue, wishlistValue);
    elements.wishlistCount.textContent = plural(wishlistProducts.length, "saved product");
    renderCompletionSpotlight(spent, openValue, inventoryValue);
    renderBarChart(elements.valueChart, [
      { label: "Spent", value: spent },
      { label: "Open carts", value: openValue },
      { label: "Available stock", value: inventoryValue },
      { label: "Catalog", value: catalogValue },
      { label: "Archived", value: archivedValue },
      { label: "Wishlist", value: wishlistValue }
    ], { colors: ["#a8ddb5", "#ffd28a", "#9ad9e3", "#c7d2e5", "#9fb0c8", "#c9b6f2"] });

    const completedByCategory = new Map();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const categoryId = item.department;
        const current = completedByCategory.get(categoryId) || 0;
        completedByCategory.set(categoryId, current + Number(item.price || 0));
      });
    });
    const cartByCategory = new Map();
    openCartEntries.forEach(({ product }) => {
      const categoryId = product.department;
      const current = cartByCategory.get(categoryId) || 0;
      cartByCategory.set(categoryId, current + productValue(product));
    });
    const categoryTotals = new Map();
    activeProducts.forEach((product) => {
      const categoryId = product.department;
      const current = categoryTotals.get(categoryId) || { inStore: 0, products: 0 };
      current.inStore += Store.getUnitsInStock(product) > 0 ? productValue(product) : 0;
      current.products += 1;
      categoryTotals.set(categoryId, current);
    });
    [...completedByCategory.keys(), ...cartByCategory.keys()].forEach((categoryId) => {
      if (!categoryTotals.has(categoryId)) {
        categoryTotals.set(categoryId, { inStore: 0, products: 0 });
      }
    });
    const categoryEntries = [...categoryTotals.entries()]
      .map(([id, totals]) => {
        const completed = completedByCategory.get(id) || 0;
        const inCart = cartByCategory.get(id) || 0;
        const inStore = Math.max(0, totals.inStore - inCart);
        return {
          id,
          label: Store.getCategoryLabel(state.data, id),
          value: totals.inStore,
          total: completed + inCart + inStore,
          completed,
          inCart,
          inStore,
          products: totals.products
        };
      })
      .sort((a, b) => b.total - a.total);
    renderVerticalCategoryChart(elements.categoryList, categoryEntries);
    elements.emptyCategories.hidden = categoryTotals.size > 0;
    renderBarChart(elements.categoryChart, categoryEntries, { colors: chartColors });

    const cartTotals = new Map();
    openCartEntries.forEach(({ cart, product }) => {
      const value = productValue(product);
      const current = cartTotals.get(cart.id) || { name: cart.name, value: 0, count: 0, items: [] };
      current.value += value;
      current.count += 1;
      current.items.push({
        id: product.id,
        title: product.title,
        value
      });
      cartTotals.set(cart.id, current);
    });
    const cartEntries = [...cartTotals.values()].sort((a, b) => b.value - a.value);
    renderCartCompositionChart(elements.cartChart, cartEntries);
  }

  async function init() {
    state.data = await Store.loadData();
    render();
  }
  bindCompletionInteractions();
  init();
})();
