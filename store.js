(function () {
  const STORE_KEY = "todoListCart.store";
  const LEGACY_PRODUCTS_KEY = "todoListCart.products";
  const LEGACY_TASKS_KEY = "todoListCart.tasks";
  const DEFAULT_CART_ID = "cart-default";
  const DEFAULT_CATEGORIES = [
    { id: "work", name: "Work", iconName: "mdi:briefcase-outline" },
    { id: "home", name: "Home", iconName: "mdi:home-outline" },
    { id: "errands", name: "Errands", iconName: "mdi:shopping-outline" },
    { id: "study", name: "Study", iconName: "mdi:book-open-page-variant-outline" }
  ];
  const DEFAULT_SETTINGS = {
    accountName: "boni aditya",
    storeName: "ToDoList Cart",
    defaultDepartment: "work",
    defaultPriority: "standard",
    defaultMoq: "1",
    defaultPrice: "0.00",
    currency: "USD",
    showTimeEquivalent: false,
    timeSeconds: "1",
    timeRate: "1",
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

  function normalizeImages(images, legacyImage = "", legacyName = "") {
    const normalized = getArray(images)
      .map((entry) => {
        if (typeof entry === "string") {
          return { src: entry.trim(), name: "" };
        }

        return {
          src: String(entry?.src || entry?.data || "").trim(),
          name: String(entry?.name || "").trim()
        };
      })
      .filter((entry) => entry.src);
    const fallbackSource = String(legacyImage || "").trim();

    if (fallbackSource && !normalized.some((entry) => entry.src === fallbackSource)) {
      normalized.unshift({ src: fallbackSource, name: String(legacyName || "").trim() });
    }

    return normalized;
  }

  function normalizeCategory(category) {
    if (typeof category === "string") {
      return {
        id: slugify(category),
        name: category.trim() || "Category",
        icon: "",
        iconName: ""
      };
    }

    return {
      id: slugify(category?.id || category?.name),
      name: String(category?.name || category?.id || "Category").trim() || "Category",
      icon: String(category?.icon || ""),
      iconName: String(category?.iconName || "")
    };
  }

  function dedupeCategories(categories) {
    const byId = new Map();

    categories.map(normalizeCategory).forEach((category) => {
      if (!byId.has(category.id)) {
        byId.set(category.id, category);
        return;
      }

      const existing = byId.get(category.id);
      byId.set(category.id, {
        ...category,
        ...existing,
        icon: existing.icon || category.icon,
        iconName: existing.iconName || category.iconName
      });
    });

    return [...byId.values()];
  }

  function createCategory(value, categories) {
    const category = normalizeCategory(value);
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
    const images = normalizeImages(product.images, product.image, product.imageName);
    const availableUnits = normalizeMoq(product.availableUnits || "1");
    const completedUnits = Math.max(0, Math.floor(Number(product.completedUnits) || 0));
    const comments = getArray(product.comments)
      .map((comment) => ({
        id: String(comment?.id || createId("comment")),
        title: String(comment?.title || "").trim(),
        text: String(comment?.text || "").trim(),
        images: normalizeImages(comment?.images, comment?.image, comment?.imageName),
        createdAt: Number(comment?.createdAt) || Date.now()
      }))
      .filter((comment) => comment.title || comment.text || comment.images.length);

    return {
      id: product.id || createId("product"),
      title: product.title || "Untitled product",
      department: slugify(product.department || "work"),
      location: String(product.location || "").trim() || "Unspecified",
      priority: product.priority || "standard",
      moq,
      effort: moq,
      price: normalizeMoney(product.price),
      availableUnits,
      completedUnits,
      inStock: product.inStock !== false && completedUnits < Number(availableUnits),
      description: product.description || "",
      images,
      image: images[0]?.src || "",
      imageName: images[0]?.name || "",
      comments,
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
    const currencies = ["USD", "INR", "EUR", "GBP", "JPY"];
    const categoryIds = new Set(getArray(categories).map((category) => category.id));
    const defaultDepartment = slugify(nextSettings.defaultDepartment || DEFAULT_SETTINGS.defaultDepartment);

    return {
      accountName: String(nextSettings.accountName || DEFAULT_SETTINGS.accountName).trim() || DEFAULT_SETTINGS.accountName,
      storeName: String(nextSettings.storeName || DEFAULT_SETTINGS.storeName).trim() || DEFAULT_SETTINGS.storeName,
      defaultDepartment: categoryIds.has(defaultDepartment) ? defaultDepartment : DEFAULT_SETTINGS.defaultDepartment,
      defaultPriority: priorities.includes(nextSettings.defaultPriority) ? nextSettings.defaultPriority : DEFAULT_SETTINGS.defaultPriority,
      defaultMoq: normalizeMoq(nextSettings.defaultMoq || nextSettings.defaultEffort || DEFAULT_SETTINGS.defaultMoq),
      defaultPrice: normalizeMoney(nextSettings.defaultPrice || DEFAULT_SETTINGS.defaultPrice),
      currency: currencies.includes(nextSettings.currency) ? nextSettings.currency : DEFAULT_SETTINGS.currency,
      showTimeEquivalent: hasOwn(settings || {}, "showTimeEquivalent")
        ? Boolean(nextSettings.showTimeEquivalent)
        : ["unit", "subunit"].includes(nextSettings.timeConversion),
      timeRate: (() => {
        const legacyRate = nextSettings.timeConversion === "subunit" ? 0.01 : 1;
        const rate = Number(nextSettings.timeRate ?? legacyRate);
        return Number.isFinite(rate) && rate > 0 ? String(rate) : String(legacyRate);
      })(),
      timeSeconds: (() => {
        const seconds = Number(nextSettings.timeSeconds ?? DEFAULT_SETTINGS.timeSeconds);
        return Number.isFinite(seconds) && seconds > 0 ? String(seconds) : DEFAULT_SETTINGS.timeSeconds;
      })(),
      checkoutBehavior: checkoutBehaviors.includes(nextSettings.checkoutBehavior) ? nextSettings.checkoutBehavior : DEFAULT_SETTINGS.checkoutBehavior,
      showImages: nextSettings.showImages !== false,
      compactMode: Boolean(nextSettings.compactMode)
    };
  }

  function normalizeOrderItem(item) {
    const moq = normalizeMoq(item.moq || item.effort || "1");
    const images = normalizeImages(item.images, item.image, item.imageName);

    return {
      productId: item.productId || "",
      title: item.title || "Untitled product",
      department: slugify(item.department || "work"),
      location: String(item.location || "").trim() || "Unspecified",
      priority: item.priority || "standard",
      moq,
      effort: moq,
      price: normalizeMoney(item.price),
      description: item.description || "",
      images,
      image: images[0]?.src || "",
      imageName: images[0]?.name || "",
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

  function createProduct({ title, department, location, priority, moq, effort, price, inStock, availableUnits, completedUnits, description, images, image, imageName }) {
    return normalizeProduct({
      id: createId("product"),
      title,
      department,
      location,
      priority,
      moq: moq || effort,
      price,
      inStock,
      availableUnits,
      completedUnits,
      description,
      images,
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
          location: product.location,
          priority: product.priority,
          moq: product.moq,
          price: product.price,
          description: product.description,
          images: product.images,
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
      ...getArray(data?.categories),
      ...DEFAULT_CATEGORIES,
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
    const productIds = new Set(products.map((product) => product.id));
    const wishlist = [...new Set(getArray(data?.wishlist).filter((productId) => productIds.has(productId)))];
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
      wishlist,
      settings
    };
  }

  function legacyTasksToProducts(tasks) {
    return getArray(tasks).map((task) => ({
      id: task.id || createId("product"),
      title: task.title || "Untitled product",
      department: task.department || "work",
      location: task.location || "Unspecified",
      priority: task.priority || "standard",
      moq: task.moq || task.effort || "1",
      price: task.price || "0.00",
      description: task.description || "",
      images: task.images,
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
    const category = getCategory(data, categoryId);
    return category?.name || categoryId || "Category";
  }

  function getCategory(data, categoryId) {
    return getArray(data?.categories).find((entry) => entry.id === categoryId) || null;
  }

  function getCategoryIconSource(category) {
    if (category?.icon) {
      return category.icon;
    }

    if (category?.iconName && category.iconName.includes(":")) {
      const [prefix, ...nameParts] = category.iconName.split(":");
      const name = nameParts.join(":");
      return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg?color=%23007185`;
    }

    return "";
  }

  function renderCategory(element, data, categoryId) {
    if (!element) {
      return;
    }

    const category = getCategory(data, categoryId);
    const label = category?.name || categoryId || "Category";
    const iconSource = getCategoryIconSource(category);
    element.replaceChildren();

    if (iconSource) {
      const image = document.createElement("img");
      image.className = "category-icon";
      image.src = iconSource;
      image.alt = "";
      element.append(image);
    }

    const text = document.createElement("span");
    text.textContent = label;
    element.append(text);
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

  function formatDateTime(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function formatMoney(value, settings = DEFAULT_SETTINGS) {
    const currency = ["USD", "INR", "EUR", "GBP", "JPY"].includes(settings?.currency)
      ? settings.currency
      : DEFAULT_SETTINGS.currency;
    const amount = Number(normalizeMoney(value));
    const money = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
      maximumFractionDigits: currency === "JPY" ? 0 : 2
    }).format(amount);
    const rate = settings?.showTimeEquivalent
      ? Number(settings.timeRate) / Number(settings.timeSeconds || 1)
      : 0;

    if (!rate) {
      return money;
    }

    const seconds = Math.round(amount / rate);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    const duration = [
      ...(hours ? [`${hours}h`] : []),
      ...(minutes ? [`${minutes}m`] : []),
      `${remainder}s`
    ].join(" ");

    return `${money} · ${duration}`;
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
    formatDateTime,
    formatMoney,
    formatMoq,
    getActiveCart,
    getCategory,
    getCategoryIconSource,
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
    renderCategory,
    saveData
  };
})();
