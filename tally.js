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
    categoryList: document.querySelector("#category-tally-list"),
    cartList: document.querySelector("#cart-tally-list"),
    emptyCategories: document.querySelector("#empty-category-tally"),
    emptyCarts: document.querySelector("#empty-cart-tally")
  };

  const itemValue = (item) => Number(item.price || 0) * Number(item.moq || item.effort || 1);
  const productValue = (product) => Number(product.price || 0) * Number(product.moq || 1);
  const money = (value) => Store.formatMoney(value, state.data.settings);
  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

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
      total + productValue(product) * Math.max(0, Number(product.availableUnits || 0) - Number(product.completedUnits || 0))
    ), 0);
    const catalogValue = state.data.products.reduce((total, product) => total + productValue(product), 0);
    const activeCart = Store.getActiveCart(state.data);

    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = activeCart.items.length;
    elements.orderCount.textContent = plural(orders.length, "order");
    elements.openItems.textContent = plural(openCartEntries.length, "open cart item");
    elements.productCount.textContent = plural(state.data.products.length, "product");
    elements.spent.textContent = money(spent);
    elements.openValue.textContent = money(openValue);
    elements.inventoryValue.textContent = money(inventoryValue);
    elements.catalogValue.textContent = money(catalogValue);

    const categoryTotals = new Map();
    state.data.products.forEach((product) => {
      const category = Store.getCategoryLabel(state.data, product.department);
      const current = categoryTotals.get(category) || { inventory: 0, products: 0 };
      current.inventory += productValue(product) * Math.max(0, Number(product.availableUnits || 0) - Number(product.completedUnits || 0));
      current.products += 1;
      categoryTotals.set(category, current);
    });
    elements.categoryList.replaceChildren(...[...categoryTotals.entries()]
      .sort(([, a], [, b]) => b.inventory - a.inventory)
      .map(([category, totals]) => createTallyItem(category, `${plural(totals.products, "product")} in catalog`, totals.inventory)));
    elements.emptyCategories.hidden = categoryTotals.size > 0;

    const cartTotals = new Map();
    openCartEntries.forEach(({ cart, product }) => {
      const current = cartTotals.get(cart.id) || { name: cart.name, value: 0, count: 0 };
      current.value += productValue(product);
      current.count += 1;
      cartTotals.set(cart.id, current);
    });
    elements.cartList.replaceChildren(...[...cartTotals.values()]
      .sort((a, b) => b.value - a.value)
      .map((cart) => createTallyItem(cart.name, plural(cart.count, "open item"), cart.value)));
    elements.emptyCarts.hidden = cartTotals.size > 0;
  }

  async function init() {
    state.data = await Store.loadData();
    render();
  }
  init();
})();
