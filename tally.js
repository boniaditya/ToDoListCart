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
    completionSummary: document.querySelector("#completion-summary"),
    completionTotalValue: document.querySelector("#completion-total-value"),
    completionRing: document.querySelector("#completion-ring"),
    completionPercent: document.querySelector("#completion-percent"),
    completionSpentValue: document.querySelector("#completion-spent-value"),
    completionSpentPercent: document.querySelector("#completion-spent-percent"),
    completionOpenValue: document.querySelector("#completion-open-value"),
    completionOpenPercent: document.querySelector("#completion-open-percent"),
    completionStockValue: document.querySelector("#completion-stock-value"),
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
    const visibleEntries = entries.filter((entry) => Number(entry.value) > 0);
    const maxValue = Math.max(...visibleEntries.map((entry) => entry.value), 0);

    if (!visibleEntries.length) {
      return;
    }

    visibleEntries.forEach((entry, index) => {
      const item = document.createElement("li");
      const value = document.createElement("b");
      const barWrap = document.createElement("div");
      const bar = document.createElement("i");
      const label = document.createElement("a");
      const detail = document.createElement("span");
      const percent = maxValue ? (Number(entry.value) / maxValue) * 100 : 0;
      const tooltip = `${entry.label}: ${money(entry.value).split(" · ")[0]} · ${plural(entry.products, "product")} in catalog`;

      item.className = "category-column-item";
      item.title = tooltip;
      item.style.setProperty("--bar-color", chartColors[index % chartColors.length]);
      value.textContent = money(entry.value).split(" · ")[0];
      barWrap.className = "category-column-bar";
      bar.style.height = `${Math.max(4, percent)}%`;
      label.className = "category-column-link";
      label.href = `products.html?department=${encodeURIComponent(entry.id)}`;
      label.setAttribute("aria-label", `View ${entry.label} products`);
      label.textContent = entry.label;
      detail.textContent = plural(entry.products, "product");
      barWrap.append(bar);
      item.append(value, barWrap, label, detail);
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
    const totalCommitment = spent + openValue;
    const spentPercent = totalCommitment ? (spent / totalCommitment) * 100 : 0;
    const openPercent = totalCommitment ? (openValue / totalCommitment) * 100 : 0;
    const ringStop = Math.min(100, Math.max(0, spentPercent));

    elements.completionTotalValue.textContent = moneyAmount(totalCommitment);
    elements.completionPercent.textContent = percentLabel(spentPercent);
    elements.completionSpentValue.textContent = moneyAmount(spent);
    elements.completionSpentPercent.textContent = `${percentLabel(spentPercent)} of total`;
    elements.completionOpenValue.textContent = moneyAmount(openValue);
    elements.completionOpenPercent.textContent = `${percentLabel(openPercent)} of total`;
    elements.completionStockValue.textContent = moneyAmount(inventoryValue);
    elements.completionRing.style.setProperty("--completion", `${ringStop}%`);

    if (totalCommitment > 0) {
      elements.completionSummary.textContent = `${moneyAmount(spent)} is complete, with ${moneyAmount(openValue)} still pending across open carts.`;
      return;
    }

    elements.completionSummary.textContent = "Completed and pending value will appear here after carts or orders have priced items.";
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
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    const orders = state.data.orders;
    const spent = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    const openCartEntries = state.data.carts.flatMap((cart) => cart.items
      .filter((item) => !item.done)
      .map((item) => ({ cart, item, product: productsById.get(item.productId) }))
      .filter((entry) => entry.product));
    const openValue = openCartEntries.reduce((total, entry) => total + productValue(entry.product), 0);
    const inventoryValue = state.data.products.reduce((total, product) => (
      total + (Store.getUnitsInStock(product) > 0 ? productValue(product) : 0)
    ), 0);
    const catalogValue = state.data.products.reduce((total, product) => total + productValue(product), 0);
    const activeCart = Store.getActiveCart(state.data);

    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = activeCart.items.length;
    elements.orderCount.textContent = plural(orders.length, "order");
    elements.openItems.textContent = plural(openCartEntries.length, "open cart item");
    elements.productCount.textContent = plural(state.data.products.length, "product");
    renderStatValue(elements.spent, spent);
    renderStatValue(elements.openValue, openValue);
    renderStatValue(elements.inventoryValue, inventoryValue);
    renderStatValue(elements.catalogValue, catalogValue);
    renderCompletionSpotlight(spent, openValue, inventoryValue);
    renderBarChart(elements.valueChart, [
      { label: "Spent", value: spent },
      { label: "Open carts", value: openValue },
      { label: "Available stock", value: inventoryValue },
      { label: "Catalog", value: catalogValue }
    ], { colors: ["#a8ddb5", "#ffd28a", "#9ad9e3", "#c7d2e5"] });

    const categoryTotals = new Map();
    state.data.products.forEach((product) => {
      const categoryId = product.department;
      const current = categoryTotals.get(categoryId) || { inventory: 0, products: 0 };
      current.inventory += Store.getUnitsInStock(product) > 0 ? productValue(product) : 0;
      current.products += 1;
      categoryTotals.set(categoryId, current);
    });
    const categoryEntries = [...categoryTotals.entries()]
      .sort(([, a], [, b]) => b.inventory - a.inventory)
      .map(([id, totals]) => ({ id, label: Store.getCategoryLabel(state.data, id), value: totals.inventory, products: totals.products }));
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
  init();
})();
