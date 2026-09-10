(function () {
  const STORE_KEY = "todoListCart.store";
  const LEGACY_PRODUCTS_KEY = "todoListCart.products";
  const LEGACY_TASKS_KEY = "todoListCart.tasks";
  const DEFAULT_CART_ID = "cart-default";
  const DEFAULT_CATEGORIES = [
    { id: "work", name: "Work" },
    { id: "home", name: "Home" },
    { id: "errands", name: "Errands" },
    { id: "study", name: "Study" }
  ];
  const DEFAULT_SETTINGS = {
    accountName: "boni aditya",
    storeName: "ToDoList Cart",
    defaultDepartment: "work",
    defaultPriority: "standard",
    defaultMoq: "1",
    defaultPrice: "0.00",
    checkoutBehavior: "keep",
    showImages: true,
    compactMode: false
  };

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function getArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function createId(prefix) {
    if (globalThis.crypto?.randomUUID) {
      return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function slugify(value) {
    const slug = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || createId("category");
  }

  function normalizeMoney(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount < 0) {
      return "0.00";
    }

    return amount.toFixed(2);
  }

  function normalizeMoq(value) {
    const moq = Math.max(1, Math.floor(Number(value) || 1));
    return String(moq);
  }

  function normalizeCategory(category) {
    if (typeof category === "string") {
      return {
        id: slugify(category),
        name: category.trim() || "Category"
      };
    }

    return {
      id: slugify(category?.id || category?.name),
      name: String(category?.name || category?.id || "Category").trim() || "Category"
    };
  }

  function dedupeCategories(categories) {
    const byId = new Map();

    categories.map(normalizeCategory).forEach((category) => {
      if (!byId.has(category.id)) {
        byId.set(category.id, category);
      }
    });

    return [...byId.values()];
  }

  function createCategory(name, categories) {
    const category = normalizeCategory(name);
    const existingIds = new Set(getArray(categories).map((entry) => normalizeCategory(entry).id));
    let id = category.id;
    let index = 2;

    while (existingIds.has(id)) {
      id = `${category.id}-${index}`;
      index += 1;
    }

    return {
      ...category,
      id
    };
  }

  function getStorageArea(name) {
    return globalThis.chrome?.storage?.[name] || null;
  }

  async function readChrome(area, keys) {
    if (!area) {
      return {};
    }

    return area.get(keys);
  }

  async function writeChrome(area, values) {
    if (!area) {
      return false;
    }

    await area.set(values);
    return true;
  }

  function readLocal(key) {
    const value = localStorage.getItem(key);
    return value === null ? undefined : JSON.parse(value);
  }

  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeProduct(product) {
    const moq = normalizeMoq(product.moq || product.effort || "1");

    return {
      id: product.id || createId("product"),
      title: product.title || "Untitled product",
      department: slugify(product.department || "work"),
      priority: product.priority || "standard",
      moq,
      effort: moq,
      price: normalizeMoney(product.price),
      description: product.description || "",
      image: product.image || "",
      imageName: product.imageName || "",
      createdAt: product.createdAt || Date.now()
    };
  }

  function normalizeCartItem(item) {
    return {
      id: item.id || createId("item"),
      productId: item.productId,
      done: Boolean(item.done),
      addedAt: item.addedAt || Date.now()
    };
  }

  function normalizeCart(cart) {
    return {
      id: cart.id || createId("cart"),
      name: cart.name || "My Cart",
      items: getArray(cart.items)
        .filter((item) => item?.productId)
        .map(normalizeCartItem),
      createdAt: cart.createdAt || Date.now()
    };
  }

  function normalizeSettings(settings, categories) {
    const nextSettings = {
      ...DEFAULT_SETTINGS,
      ...(settings || {})
    };
    const priorities = ["standard", "important", "urgent"];
    const checkoutBehaviors = ["keep", "clear"];
    const categoryIds = new Set(getArray(categories).map((category) => category.id));
    const defaultDepartment = slugify(nextSettings.defaultDepartment || DEFAULT_SETTINGS.defaultDepartment);

    return {
      accountName: String(nextSettings.accountName || DEFAULT_SETTINGS.accountName).trim() || DEFAULT_SETTINGS.accountName,
      storeName: String(nextSettings.storeName || DEFAULT_SETTINGS.storeName).trim() || DEFAULT_SETTINGS.storeName,
      defaultDepartment: categoryIds.has(defaultDepartment) ? defaultDepartment : DEFAULT_SETTINGS.defaultDepartment,
      defaultPriority: priorities.includes(nextSettings.defaultPriority) ? nextSettings.defaultPriority : DEFAULT_SETTINGS.defaultPriority,
      defaultMoq: normalizeMoq(nextSettings.defaultMoq || nextSettings.defaultEffort || DEFAULT_SETTINGS.defaultMoq),
      defaultPrice: normalizeMoney(nextSettings.defaultPrice || DEFAULT_SETTINGS.defaultPrice),
      checkoutBehavior: checkoutBehaviors.includes(nextSettings.checkoutBehavior) ? nextSettings.checkoutBehavior : DEFAULT_SETTINGS.checkoutBehavior,
      showImages: nextSettings.showImages !== false,
      compactMode: Boolean(nextSettings.compactMode)
    };
  }

  function normalizeOrderItem(item) {
    const moq = normalizeMoq(item.moq || item.effort || "1");

    return {
      productId: item.productId || "",
      title: item.title || "Untitled product",
      department: slugify(item.department || "work"),
      priority: item.priority || "standard",
      moq,
      effort: moq,
      price: normalizeMoney(item.price),
      description: item.description || "",
      image: item.image || "",
      imageName: item.imageName || "",
      done: item.done !== false
    };
  }

  function normalizeOrder(order) {
    const items = getArray(order?.items).map(normalizeOrderItem);

    return {
      id: order?.id || createId("order"),
      cartId: order?.cartId || "",
      cartName: order?.cartName || "My Cart",
      items,
      totalMoq: String(order?.totalMoq || order?.totalEffort || getTotalMoq(items)),
      totalEffort: String(order?.totalEffort || order?.totalMoq || getTotalMoq(items)),
      totalAmount: normalizeMoney(order?.totalAmount || getTotalAmount(items)),
      createdAt: order?.createdAt || Date.now()
    };
  }

  function createCart(name) {
    return normalizeCart({
      id: createId("cart"),
      name: name || "New Cart",
      items: [],
      createdAt: Date.now()
    });
  }

  function createProduct({ title, department, priority, moq, effort, price, description, image, imageName }) {
    return normalizeProduct({
      id: createId("product"),
      title,
      department,
      priority,
      moq: moq || effort,
      price,
      description,
      image,
      imageName,
      createdAt: Date.now()
    });
  }

  function createOrder(cart, productsById) {
    const items = getArray(cart.items)
      .map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          return null;
        }

        return normalizeOrderItem({
          productId: product.id,
          title: product.title,
          department: product.department,
          priority: product.priority,
          moq: product.moq,
          price: product.price,
          description: product.description,
          image: product.image,
          imageName: product.imageName,
          done: true
        });
      })
      .filter(Boolean);

    return normalizeOrder({
      id: createId("order"),
      cartId: cart.id,
      cartName: cart.name,
      items,
      totalMoq: getTotalMoq(items),
      totalAmount: getTotalAmount(items),
      createdAt: Date.now()
    });
  }

  function buildLegacyCartItems(rawProducts) {
    return rawProducts
      .filter((product) => product.inCart)
      .map((product) => normalizeCartItem({
        productId: product.id,
        done: product.done,
        addedAt: product.createdAt || Date.now()
      }));
  }

  function buildCategories(data, products) {
    const productCategories = products.map((product) => ({
      id: product.department,
      name: product.department
    }));

    return dedupeCategories([
      ...DEFAULT_CATEGORIES,
      ...getArray(data?.categories),
      ...productCategories
    ]);
  }

  function normalizeData(data) {
    const rawProducts = getArray(data?.products);
    const products = rawProducts.map(normalizeProduct);
    const categories = buildCategories(data, products);
    const carts = getArray(data?.carts).map(normalizeCart);
    const fallbackCart = normalizeCart({
      id: DEFAULT_CART_ID,
      name: "My Cart",
      items: buildLegacyCartItems(rawProducts),
      createdAt: Date.now()
    });
    const normalizedCarts = carts.length ? carts : [fallbackCart];
    const orders = getArray(data?.orders).map(normalizeOrder);
    const settings = normalizeSettings(data?.settings, categories);
    const activeCartId = normalizedCarts.some((cart) => cart.id === data?.activeCartId)
      ? data.activeCartId
      : normalizedCarts[0].id;

    return {
      products,
      categories,
      carts: normalizedCarts,
      activeCartId,
      orders,
      settings
    };
  }

  function legacyTasksToProducts(tasks) {
    return getArray(tasks).map((task) => ({
      id: task.id || createId("product"),
      title: task.title || "Untitled product",
      department: task.department || "work",
      priority: task.priority || "standard",
      moq: task.moq || task.effort || "1",
      price: task.price || "0.00",
      description: task.description || "",
      image: task.image || "",
      imageName: task.imageName || "",
      inCart: true,
      done: Boolean(task.done),
      createdAt: task.createdAt || Date.now()
    }));
  }

  async function loadData() {
    const localArea = getStorageArea("local");
    const syncArea = getStorageArea("sync");
    const localResult = await readChrome(localArea, [STORE_KEY]);

    if (hasOwn(localResult, STORE_KEY)) {
      return normalizeData(localResult[STORE_KEY]);
    }

    const localFallback = readLocal(STORE_KEY);

    if (localFallback !== undefined) {
      return normalizeData(localFallback);
    }

    const legacyResult = await readChrome(syncArea, [LEGACY_PRODUCTS_KEY, LEGACY_TASKS_KEY]);
    let legacyProducts = hasOwn(legacyResult, LEGACY_PRODUCTS_KEY)
      ? getArray(legacyResult[LEGACY_PRODUCTS_KEY])
      : legacyTasksToProducts(legacyResult[LEGACY_TASKS_KEY]);

    if (!legacyProducts.length) {
      const localLegacyProducts = readLocal(LEGACY_PRODUCTS_KEY);
      const localLegacyTasks = readLocal(LEGACY_TASKS_KEY);
      legacyProducts = localLegacyProducts !== undefined
        ? getArray(localLegacyProducts)
        : legacyTasksToProducts(localLegacyTasks);
    }

    const legacyData = normalizeData({ products: legacyProducts });

    if (legacyData.products.length) {
      await saveData(legacyData);
    }

    return legacyData;
  }

  async function saveData(data) {
    const normalizedData = normalizeData(data);
    const localArea = getStorageArea("local");

    if (await writeChrome(localArea, { [STORE_KEY]: normalizedData })) {
      return normalizedData;
    }

    writeLocal(STORE_KEY, normalizedData);
    return normalizedData;
  }

  function getActiveCart(data) {
    return data.carts.find((cart) => cart.id === data.activeCartId) || data.carts[0];
  }

  function getCategoryLabel(data, categoryId) {
    const category = getArray(data?.categories).find((entry) => entry.id === categoryId);
    return category?.name || categoryId || "Category";
  }

  function getTotalMoq(items) {
    return getArray(items).reduce((total, item) => total + Number(item.moq || item.effort || 0), 0);
  }

  function getTotalAmount(items) {
    return getArray(items).reduce((total, item) => {
      const price = Number(item.price || 0);
      const moq = Number(item.moq || item.effort || 1);
      return total + (Number.isFinite(price) && Number.isFinite(moq) ? price * moq : 0);
    }, 0);
  }

  function getPriorityLabel(priority) {
    if (priority === "urgent") {
      return "Urgent";
    }

    if (priority === "important") {
      return "Important";
    }

    return "Standard";
  }

  function getStars(priority) {
    if (priority === "urgent") {
      return "*****";
    }

    if (priority === "important") {
      return "****";
    }

    return "***";
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(timestamp));
  }

  function formatMoney(value) {
    return `$${normalizeMoney(value)}`;
  }

  function formatMoq(value) {
    return `MOQ ${normalizeMoq(value)}`;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  }

  function getExtensionUrl(path) {
    return globalThis.chrome?.runtime?.getURL
      ? globalThis.chrome.runtime.getURL(path)
      : path;
  }

  function openExtensionPage(path) {
    const url = getExtensionUrl(path);

    if (globalThis.chrome?.tabs?.create) {
      globalThis.chrome.tabs.create({ url });
      return;
    }

    const opened = window.open(url, "_blank", "noopener");

    if (!opened) {
      window.location.href = url;
    }
  }

  globalThis.ToDoCartStore = {
    createCart,
    createCategory,
    createId,
    createOrder,
    createProduct,
    fileToDataUrl,
    formatDate,
    formatMoney,
    formatMoq,
    getActiveCart,
    getCategoryLabel,
    getExtensionUrl,
    getPriorityLabel,
    getStars,
    getTotalAmount,
    getTotalMoq,
    loadData,
    normalizeCategory,
    normalizeData,
    normalizeMoq,
    normalizeMoney,
    normalizeProduct,
    normalizeSettings,
    openExtensionPage,
    saveData
  };
})();
