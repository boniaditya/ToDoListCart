(function () {
  const STORE_KEY = "todoListCart.store";
  const BACKUP_HISTORY_KEY = "todoListCart.backupHistory";
  const DEMO_STATE_KEY = "todoListCart.demoState";
  const LEGACY_PRODUCTS_KEY = "todoListCart.products";
  const LEGACY_TASKS_KEY = "todoListCart.tasks";
  const DEFAULT_CART_ID = "cart-default";
  const DEFAULT_CATEGORIES = [
    { id: "work", name: "Work", iconName: "mdi:briefcase-outline" },
    { id: "home", name: "Home", iconName: "mdi:home-outline" },
    { id: "errands", name: "Errands", iconName: "mdi:shopping-outline" },
    { id: "study", name: "Study", iconName: "mdi:book-open-page-variant-outline" }
  ];
  const MOM_ICON_NAME = "mdi:mother-heart";
  const MOM_ICON_PATH = "M12 2c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3m8 16l-2-5.44c-.35-.99-.66-1.85-2-2.56c-1.37-.7-2.37-1-4-1c-1.61 0-2.61.3-4 1c-1.32.71-1.63 1.57-2 2.56L4 18c-.23 1.13 2.38 2.44 4.13 3.19c1.21.53 2.51.81 3.87.81c1.38 0 2.67-.28 3.89-.81c1.75-.75 4.36-2.06 4.11-3.19m-4.58-.5L12 21l-3.42-3.5c-.36-.38-.58-.89-.58-1.45c0-1.13.9-2.05 2-2.05c.55 0 1.06.23 1.42.61l.58.59l.58-.6c.36-.37.87-.6 1.42-.6c1.11 0 2 .92 2 2.05c0 .56-.22 1.08-.58 1.45";
  const LOCAL_CATEGORY_ICON_GLYPHS = Object.freeze({
    "mdi:briefcase-outline": "💼",
    "mdi:home-outline": "⌂",
    "mdi:shopping-outline": "🛍",
    "mdi:book-open-page-variant-outline": "📖",
    "local:tag": "🏷",
    "local:tools": "🛠",
    "local:car": "🚗",
    "local:truck": "🚚",
    "local:computer": "💻",
    "local:camera": "📷",
    "local:calendar": "🗓",
    "local:heart": "♥",
    "local:star": "★",
    "local:lightbulb": "💡",
    "local:food": "🍽",
    "local:travel": "✈",
    "local:health": "✚",
    "local:music": "♫",
    "local:education": "🎓",
    "local:finance": "₹"
  });
  // These definitions are registered from the extension's bundled icon JSON
  // files. They are never requested from a remote host at runtime.
  const BUNDLED_ICON_DEFINITIONS = new Map();
  const BUNDLED_ICON_FILES = Object.freeze(["icon-data/tabler.json", "icon-data/mdi.json"]);
  const PRODUCT_PLACEHOLDER_ICON_RULES = Object.freeze([
    { iconName: "mdi:water-boiler", keywords: ["geyser", "water heater", "boiler", "heater"] },
    { iconName: "mdi:lightning-bolt-outline", keywords: ["mcb", "trip", "voltage", "current", "electrical", "electric", "power", "circuit", "breaker"] },
    { iconName: "mdi:power-plug-outline", keywords: ["plug", "socket", "adapter", "charger", "cable"] },
    { iconName: "mdi:pipe-valve", keywords: ["plumbing", "pipe", "valve", "tap", "faucet"] },
    { iconName: "mdi:sofa-outline", keywords: ["interior", "interiors", "furniture", "sofa", "decor"] },
    { iconName: "mdi:tools", keywords: ["repair", "service", "maintenance", "fix", "install"] },
    { iconName: "mdi:cart-outline", keywords: ["buy", "purchase", "shopping", "order"] },
    { iconName: "mdi:package-variant-closed", keywords: ["package", "box", "stock", "inventory", "supply"] },
    { iconName: "mdi:briefcase-outline", keywords: ["work", "office", "business"] },
    { iconName: "mdi:home-outline", keywords: ["home", "house", "room"] },
    { iconName: "mdi:book-open-page-variant-outline", keywords: ["study", "book", "learn", "course"] }
  ]);
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
    stickyCheckoutShowSummary: true,
    stickyCheckoutShowProgress: true,
    stickyCheckoutCompact: false,
    cartPageShowManager: true,
    cartPageShowProgress: true,
    cartPageShowImages: true,
    cartPageShowDescriptions: true,
    cartPageShowStock: true,
    cartPageShowRemoveButtons: true,
    showImages: true,
    compactMode: false,
    commentComposerPlacement: "below",
    showWeeklyCommentBadge: true,
    defaultProductType: "product",
    defaultProductView: "card",
    productsPerPage: 12,
    showProductDescriptions: true,
    showDeliveryStatus: true,
    showLocationIcon: true,
    showTimeIcon: true,
    listingShowImages: true,
    listingCompactMode: false,
    listingShowProductDescriptions: true,
    listingShowDeliveryStatus: true,
    listingShowLocationIcon: true,
    listingShowTimeIcon: true,
    listingShowPrice: true,
    listingShowTime: true,
    listingShowCategory: true,
    listingShowLocation: true,
    listingShowRatings: true,
    listingShowMoq: true,
    listingShowUnits: true,
    popupShowImages: true,
    popupCompactMode: true,
    popupShowProductDescriptions: false,
    popupShowDeliveryStatus: false,
    popupShowLocationIcon: false,
    popupShowTimeIcon: false,
    popupShowPrice: false,
    popupShowTime: false
    ,
    popupShowCategory: false,
    popupShowLocation: false
    ,
    popupShowRatings: false,
    popupShowMoq: false,
    popupShowUnits: false
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
          name: String(entry?.name || "").trim(),
          cardSrc: String(entry?.cardSrc || "").trim()
        };
      })
      .filter((entry) => entry.src);
    const fallbackSource = String(legacyImage || "").trim();

    if (fallbackSource && !normalized.some((entry) => entry.src === fallbackSource)) {
      normalized.unshift({ src: fallbackSource, name: String(legacyName || "").trim() });
    }

    return normalized;
  }

  function createCardImageCopy(source) {
    const cardSize = 720;

    return new Promise((resolve) => {
      const image = new Image();

      image.addEventListener("load", () => {
        if (!image.naturalWidth || !image.naturalHeight) {
          resolve("");
          return;
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          resolve("");
          return;
        }

        canvas.width = cardSize;
        canvas.height = cardSize;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, cardSize, cardSize);

        const scale = Math.min(cardSize / image.naturalWidth, cardSize / image.naturalHeight);
        const width = Math.round(image.naturalWidth * scale);
        const height = Math.round(image.naturalHeight * scale);
        const x = Math.round((cardSize - width) / 2);
        const y = Math.round((cardSize - height) / 2);

        context.drawImage(image, x, y, width, height);

        try {
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        } catch {
          resolve("");
        }
      }, { once: true });
      image.addEventListener("error", () => resolve(""), { once: true });
      image.src = source;
    });
  }

  async function prepareCardImages(images) {
    return Promise.all(normalizeImages(images).map(async (entry) => ({
      ...entry,
      cardSrc: entry.cardSrc || await createCardImageCopy(entry.src)
    })));
  }

  function normalizeCategory(category) {
    if (typeof category === "string") {
      const id = slugify(category);
      return {
        id,
        name: category.trim() || "Category",
        icon: "",
        iconName: id === "mom" ? MOM_ICON_NAME : ""
      };
    }

    const id = slugify(category?.id || category?.name);
    const icon = String(category?.icon || "");
    const savedIconName = String(category?.iconName || "");
    const missingIcon = !icon && !savedIconName;
    const genericTag = ["local:tag", "mdi:tag-outline"].includes(savedIconName);
    const useMomDefault = id === "mom" && (missingIcon || genericTag);
    return {
      id,
      name: String(category?.name || category?.id || "Category").trim() || "Category",
      icon: useMomDefault ? "" : icon,
      iconName: useMomDefault ? MOM_ICON_NAME : savedIconName
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
    const savedTotalPrice = normalizeMoney(product.price ?? product.totalPrice);
    const explicitUnitPrice = product.unitPrice ?? product.pricePerUnit;
    const derivedUnitPrice = Number(availableUnits) > 0 ? Number(savedTotalPrice) / Number(availableUnits) : Number(savedTotalPrice);
    const unitPrice = normalizeMoney(explicitUnitPrice ?? derivedUnitPrice);
    const totalPrice = explicitUnitPrice == null
      ? savedTotalPrice
      : normalizeMoney(Number(unitPrice) * Number(availableUnits));
    const completedUnits = Math.max(0, Math.floor(Number(product.completedUnits) || 0));
    const referenceUrls = getArray(product.referenceUrls)
      .map((value) => {
        try {
          const url = new URL(String(value || "").trim());
          return ["http:", "https:"].includes(url.protocol) ? url.href : "";
        } catch {
          return "";
        }
      })
      .filter((url, index, urls) => url && urls.indexOf(url) === index);
    const relatedProductIds = [...new Set(getArray(product.relatedProductIds).map(String).filter(Boolean))];
    const bundleProductIds = [...new Set(getArray(product.bundleProductIds).map(String).filter(Boolean))];
    const addonProductIds = [...new Set(getArray(product.addonProductIds).map(String).filter(Boolean))];
    const productType = ["product", "service", "project"].includes(product.productType)
      ? product.productType
      : "product";
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
      productType,
      location: String(product.location || "").trim() || "Unspecified",
      priority: product.priority || "standard",
      moq,
      effort: moq,
      unitPrice,
      price: totalPrice,
      availableUnits,
      completedUnits,
      referenceUrls,
      relatedProductIds,
      bundleProductIds,
      addonProductIds,
      inStock: product.inStock !== false && completedUnits < Number(availableUnits),
      description: product.description || "",
      images,
      image: images[0]?.src || "",
      imageName: images[0]?.name || "",
      comments,
      archived: product.archived === true
        || product.archived === "true"
        || product.archived === 1
        || product.archived === "1",
      createdAt: product.createdAt || Date.now()
    };
  }

  function normalizeRelatedProductLinks(products) {
    const productIds = new Set(products.map((product) => product.id));
    const validLinkedIds = (product, ids) => [...new Set(getArray(ids)
      .map(String)
      .filter((linkedId) => linkedId !== product.id && productIds.has(linkedId)))];
    const relatedByProductId = new Map(products.map((product) => [
      product.id,
      new Set(product.relatedProductIds.filter((relatedId) => relatedId !== product.id && productIds.has(relatedId)))
    ]));

    relatedByProductId.forEach((relatedIds, productId) => {
      relatedIds.forEach((relatedId) => relatedByProductId.get(relatedId)?.add(productId));
    });

    return products.map((product) => ({
      ...product,
      relatedProductIds: [...relatedByProductId.get(product.id)],
      bundleProductIds: validLinkedIds(product, product.bundleProductIds),
      addonProductIds: validLinkedIds(product, product.addonProductIds)
    }));
  }

  function setRelatedProductLinks(products, productId, relatedProductIds) {
    const productIds = new Set(products.map((product) => product.id));
    const selectedIds = new Set(getArray(relatedProductIds)
      .map(String)
      .filter((relatedId) => relatedId !== productId && productIds.has(relatedId)));

    return products.map((product) => {
      const nextRelatedIds = new Set(product.relatedProductIds || []);

      if (product.id === productId) {
        return {
          ...product,
          relatedProductIds: [...selectedIds]
        };
      }

      if (selectedIds.has(product.id)) {
        nextRelatedIds.add(productId);
      } else {
        nextRelatedIds.delete(productId);
      }

      return {
        ...product,
        relatedProductIds: [...nextRelatedIds]
      };
    });
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

  function normalizeVendorContact(contact) {
    return {
      id: String(contact?.id || createId("spoc")),
      name: String(contact?.name || "").trim(),
      role: String(contact?.role || "").trim(),
      phone: String(contact?.phone || "").trim(),
      email: String(contact?.email || "").trim()
    };
  }

  function normalizeVendor(vendor, validProductIds = null) {
    const vendorTypes = ["person", "organization", "business"];
    const productIds = [...new Set(getArray(vendor?.productIds).map(String).filter(Boolean))]
      .filter((productId) => !validProductIds || validProductIds.has(productId));
    const contacts = getArray(vendor?.contacts || vendor?.spocs)
      .map(normalizeVendorContact)
      .filter((contact) => contact.name || contact.role || contact.phone || contact.email);
    const referenceUrls = getArray(vendor?.referenceUrls || vendor?.links)
      .map((url) => String(url || "").trim())
      .filter(Boolean);
    const website = String(vendor?.website || "").trim();
    if (website && !referenceUrls.includes(website)) {
      referenceUrls.unshift(website);
    }
    const images = normalizeImages(vendor?.images, vendor?.image, vendor?.imageName);

    return {
      id: String(vendor?.id || createId("vendor")),
      name: String(vendor?.name || "Untitled vendor").trim() || "Untitled vendor",
      type: vendorTypes.includes(vendor?.type) ? vendor.type : "business",
      phone: String(vendor?.phone || "").trim(),
      email: String(vendor?.email || "").trim(),
      website,
      address: String(vendor?.address || "").trim(),
      notes: String(vendor?.notes || "").trim(),
      referenceUrls: [...new Set(referenceUrls)],
      images,
      image: images[0]?.src || "",
      imageName: images[0]?.name || "",
      productIds,
      contacts,
      createdAt: Number(vendor?.createdAt) || Date.now(),
      updatedAt: Number(vendor?.updatedAt) || Number(vendor?.createdAt) || Date.now()
    };
  }

  function createVendor(vendor) {
    return normalizeVendor({
      ...vendor,
      id: createId("vendor"),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  function normalizeSettings(settings, categories) {
    const nextSettings = {
      ...DEFAULT_SETTINGS,
      ...(settings || {})
    };
    const priorities = ["standard", "important", "urgent"];
    const checkoutBehaviors = ["keep", "clear"];
    const currencies = ["USD", "INR", "EUR", "GBP", "JPY"];
    const commentComposerPlacements = ["below", "side"];
    const productTypes = ["product", "service", "project"];
    const productViews = ["card", "list"];
    const pageSizes = [6, 12, 24, 48];
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
      stickyCheckoutShowSummary: hasOwn(settings || {}, "stickyCheckoutShowSummary") ? nextSettings.stickyCheckoutShowSummary !== false : DEFAULT_SETTINGS.stickyCheckoutShowSummary,
      stickyCheckoutShowProgress: hasOwn(settings || {}, "stickyCheckoutShowProgress") ? nextSettings.stickyCheckoutShowProgress !== false : DEFAULT_SETTINGS.stickyCheckoutShowProgress,
      stickyCheckoutCompact: hasOwn(settings || {}, "stickyCheckoutCompact") ? Boolean(nextSettings.stickyCheckoutCompact) : DEFAULT_SETTINGS.stickyCheckoutCompact,
      cartPageShowManager: hasOwn(settings || {}, "cartPageShowManager") ? nextSettings.cartPageShowManager !== false : DEFAULT_SETTINGS.cartPageShowManager,
      cartPageShowProgress: hasOwn(settings || {}, "cartPageShowProgress") ? nextSettings.cartPageShowProgress !== false : DEFAULT_SETTINGS.cartPageShowProgress,
      cartPageShowImages: hasOwn(settings || {}, "cartPageShowImages") ? nextSettings.cartPageShowImages !== false : DEFAULT_SETTINGS.cartPageShowImages,
      cartPageShowDescriptions: hasOwn(settings || {}, "cartPageShowDescriptions") ? nextSettings.cartPageShowDescriptions !== false : DEFAULT_SETTINGS.cartPageShowDescriptions,
      cartPageShowStock: hasOwn(settings || {}, "cartPageShowStock") ? nextSettings.cartPageShowStock !== false : DEFAULT_SETTINGS.cartPageShowStock,
      cartPageShowRemoveButtons: hasOwn(settings || {}, "cartPageShowRemoveButtons") ? nextSettings.cartPageShowRemoveButtons !== false : DEFAULT_SETTINGS.cartPageShowRemoveButtons,
      showImages: nextSettings.showImages !== false,
      compactMode: Boolean(nextSettings.compactMode),
      commentComposerPlacement: commentComposerPlacements.includes(nextSettings.commentComposerPlacement)
        ? nextSettings.commentComposerPlacement
        : DEFAULT_SETTINGS.commentComposerPlacement,
      showWeeklyCommentBadge: hasOwn(settings || {}, "showWeeklyCommentBadge")
        ? nextSettings.showWeeklyCommentBadge !== false
        : DEFAULT_SETTINGS.showWeeklyCommentBadge,
      defaultProductType: productTypes.includes(nextSettings.defaultProductType)
        ? nextSettings.defaultProductType
        : DEFAULT_SETTINGS.defaultProductType,
      defaultProductView: productViews.includes(nextSettings.defaultProductView)
        ? nextSettings.defaultProductView
        : DEFAULT_SETTINGS.defaultProductView,
      productsPerPage: pageSizes.includes(Number(nextSettings.productsPerPage))
        ? Number(nextSettings.productsPerPage)
        : DEFAULT_SETTINGS.productsPerPage,
      showProductDescriptions: nextSettings.showProductDescriptions !== false,
      showDeliveryStatus: nextSettings.showDeliveryStatus !== false,
      showLocationIcon: nextSettings.showLocationIcon !== false,
      showTimeIcon: nextSettings.showTimeIcon !== false,
      listingShowImages: hasOwn(settings || {}, "listingShowImages") ? nextSettings.listingShowImages !== false : nextSettings.showImages !== false,
      listingCompactMode: hasOwn(settings || {}, "listingCompactMode") ? Boolean(nextSettings.listingCompactMode) : Boolean(nextSettings.compactMode),
      listingShowProductDescriptions: hasOwn(settings || {}, "listingShowProductDescriptions") ? nextSettings.listingShowProductDescriptions !== false : nextSettings.showProductDescriptions !== false,
      listingShowDeliveryStatus: hasOwn(settings || {}, "listingShowDeliveryStatus") ? nextSettings.listingShowDeliveryStatus !== false : nextSettings.showDeliveryStatus !== false,
      listingShowLocationIcon: hasOwn(settings || {}, "listingShowLocationIcon") ? nextSettings.listingShowLocationIcon !== false : nextSettings.showLocationIcon !== false,
      listingShowTimeIcon: hasOwn(settings || {}, "listingShowTimeIcon") ? nextSettings.listingShowTimeIcon !== false : nextSettings.showTimeIcon !== false,
      listingShowPrice: hasOwn(settings || {}, "listingShowPrice") ? nextSettings.listingShowPrice !== false : true,
      listingShowTime: hasOwn(settings || {}, "listingShowTime") ? nextSettings.listingShowTime !== false : true,
      listingShowCategory: hasOwn(settings || {}, "listingShowCategory") ? nextSettings.listingShowCategory !== false : true,
      listingShowLocation: hasOwn(settings || {}, "listingShowLocation") ? nextSettings.listingShowLocation !== false : true,
      listingShowRatings: hasOwn(settings || {}, "listingShowRatings") ? nextSettings.listingShowRatings !== false : true,
      listingShowMoq: hasOwn(settings || {}, "listingShowMoq") ? nextSettings.listingShowMoq !== false : true,
      listingShowUnits: hasOwn(settings || {}, "listingShowUnits") ? nextSettings.listingShowUnits !== false : true,
      popupShowImages: hasOwn(settings || {}, "popupShowImages") ? nextSettings.popupShowImages !== false : DEFAULT_SETTINGS.popupShowImages,
      popupCompactMode: hasOwn(settings || {}, "popupCompactMode") ? Boolean(nextSettings.popupCompactMode) : DEFAULT_SETTINGS.popupCompactMode,
      popupShowProductDescriptions: hasOwn(settings || {}, "popupShowProductDescriptions") ? nextSettings.popupShowProductDescriptions !== false : DEFAULT_SETTINGS.popupShowProductDescriptions,
      popupShowDeliveryStatus: hasOwn(settings || {}, "popupShowDeliveryStatus") ? nextSettings.popupShowDeliveryStatus !== false : DEFAULT_SETTINGS.popupShowDeliveryStatus,
      popupShowLocationIcon: hasOwn(settings || {}, "popupShowLocationIcon") ? nextSettings.popupShowLocationIcon !== false : DEFAULT_SETTINGS.popupShowLocationIcon,
      popupShowTimeIcon: hasOwn(settings || {}, "popupShowTimeIcon") ? nextSettings.popupShowTimeIcon !== false : DEFAULT_SETTINGS.popupShowTimeIcon,
      popupShowPrice: hasOwn(settings || {}, "popupShowPrice") ? nextSettings.popupShowPrice !== false : DEFAULT_SETTINGS.popupShowPrice,
      popupShowTime: hasOwn(settings || {}, "popupShowTime") ? nextSettings.popupShowTime !== false : DEFAULT_SETTINGS.popupShowTime,
      popupShowCategory: hasOwn(settings || {}, "popupShowCategory") ? nextSettings.popupShowCategory !== false : DEFAULT_SETTINGS.popupShowCategory,
      popupShowLocation: hasOwn(settings || {}, "popupShowLocation") ? nextSettings.popupShowLocation !== false : DEFAULT_SETTINGS.popupShowLocation
      ,
      popupShowRatings: hasOwn(settings || {}, "popupShowRatings") ? nextSettings.popupShowRatings !== false : DEFAULT_SETTINGS.popupShowRatings,
      popupShowMoq: hasOwn(settings || {}, "popupShowMoq") ? nextSettings.popupShowMoq !== false : DEFAULT_SETTINGS.popupShowMoq,
      popupShowUnits: hasOwn(settings || {}, "popupShowUnits") ? nextSettings.popupShowUnits !== false : DEFAULT_SETTINGS.popupShowUnits
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
      unitPrice: normalizeMoney(item.unitPrice ?? item.pricePerUnit ?? item.price),
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
    const subtotalAmount = normalizeMoney(order?.subtotalAmount ?? getTotalAmount(items));
    const discountAmount = normalizeMoney(order?.discountAmount ?? 0);

    return {
      id: order?.id || createId("order"),
      cartId: order?.cartId || "",
      cartName: order?.cartName || "My Cart",
      items,
      totalMoq: String(order?.totalMoq || order?.totalEffort || getTotalMoq(items)),
      totalEffort: String(order?.totalEffort || order?.totalMoq || getTotalMoq(items)),
      subtotalAmount,
      discountAmount,
      couponCode: String(order?.couponCode || "").trim(),
      totalAmount: normalizeMoney(order?.totalAmount ?? Math.max(0, Number(subtotalAmount) - Number(discountAmount))),
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

  function createProduct({ title, department, productType, location, priority, moq, effort, unitPrice, price, inStock, availableUnits, completedUnits, description, referenceUrls, relatedProductIds, bundleProductIds, addonProductIds, images, image, imageName }) {
    return normalizeProduct({
      id: createId("product"),
      title,
      department,
      productType,
      location,
      priority,
      moq: moq || effort,
      unitPrice,
      price,
      inStock,
      availableUnits,
      completedUnits,
      description,
      referenceUrls,
      relatedProductIds,
      bundleProductIds,
      addonProductIds,
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
          unitPrice: product.unitPrice,
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
    const products = normalizeRelatedProductLinks(rawProducts.map(normalizeProduct));
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
    const vendors = getArray(data?.vendors).map((vendor) => normalizeVendor(vendor, productIds));
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
      vendors,
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
      unitPrice: task.unitPrice || task.pricePerUnit || "",
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

  function watchDataChanges(callback) {
    const storageChanges = globalThis.chrome?.storage?.onChanged;
    if (!storageChanges || typeof callback !== "function") return () => {};

    let refreshPending = false;
    let refreshRunning = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden") {
        refreshPending = true;
        return;
      }
      if (refreshRunning) {
        refreshPending = true;
        return;
      }
      refreshRunning = true;
      refreshPending = false;
      try {
        await callback();
      } finally {
        refreshRunning = false;
        if (refreshPending && document.visibilityState !== "hidden") refresh();
      }
    };
    const onStorageChanged = (changes, areaName) => {
      if (areaName === "local" && hasOwn(changes || {}, STORE_KEY)) refresh();
    };
    const onVisibilityChanged = () => {
      if (refreshPending && document.visibilityState !== "hidden") refresh();
    };

    storageChanges.addListener(onStorageChanged);
    document.addEventListener("visibilitychange", onVisibilityChanged);
    return () => {
      storageChanges.removeListener(onStorageChanged);
      document.removeEventListener("visibilitychange", onVisibilityChanged);
    };
  }

  async function loadBackupHistory() {
    const localArea = getStorageArea("local");
    const result = await readChrome(localArea, [BACKUP_HISTORY_KEY]);
    if (hasOwn(result, BACKUP_HISTORY_KEY)) {
      return getArray(result[BACKUP_HISTORY_KEY]);
    }

    return getArray(readLocal(BACKUP_HISTORY_KEY));
  }

  async function saveBackupHistory(history) {
    const nextHistory = getArray(history);
    const localArea = getStorageArea("local");

    if (await writeChrome(localArea, { [BACKUP_HISTORY_KEY]: nextHistory })) {
      return nextHistory;
    }

    writeLocal(BACKUP_HISTORY_KEY, nextHistory);
    return nextHistory;
  }

  async function loadDemoState() {
    const localArea = getStorageArea("local");
    const result = await readChrome(localArea, [DEMO_STATE_KEY]);
    const value = hasOwn(result, DEMO_STATE_KEY) ? result[DEMO_STATE_KEY] : readLocal(DEMO_STATE_KEY);
    return {
      enabled: value?.enabled === true,
      version: Math.max(0, Number(value?.version) || 0),
      originalData: value?.originalData ? normalizeData(value.originalData) : null
    };
  }

  async function saveDemoState(value) {
    const nextValue = {
      enabled: value?.enabled === true,
      version: Math.max(0, Number(value?.version) || 0),
      originalData: value?.originalData || null
    };
    const localArea = getStorageArea("local");
    if (await writeChrome(localArea, { [DEMO_STATE_KEY]: nextValue })) {
      return nextValue;
    }
    writeLocal(DEMO_STATE_KEY, nextValue);
    return nextValue;
  }

  async function loadBundledIconCollections() {
    if (BUNDLED_ICON_DEFINITIONS.size) {
      return BUNDLED_ICON_DEFINITIONS.size;
    }

    try {
      const collections = await Promise.all(BUNDLED_ICON_FILES.map(async (file) => {
        const response = await fetch(getExtensionUrl(file));
        if (!response.ok) {
          throw new Error(`Unable to load ${file}`);
        }
        return response.json();
      }));
      collections.forEach(registerBundledIconCollection);
    } catch (error) {
      console.warn("Unable to load bundled icon collections.", error);
    }

    return BUNDLED_ICON_DEFINITIONS.size;
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
    if (category?.icon && !/^https?:/i.test(category.icon)) {
      return category.icon;
    }

    const iconName = String(category?.iconName || "");
    const bundledIcon = BUNDLED_ICON_DEFINITIONS.get(iconName);
    if (bundledIcon) {
      const width = bundledIcon.width || 24;
      const height = bundledIcon.height || 24;
      const isTabler = bundledIcon.collectionPrefix === "tabler";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" color="#007185" fill="${isTabler ? "none" : "currentColor"}" stroke="${isTabler ? "currentColor" : "none"}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${bundledIcon.body}</svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    if (iconName === MOM_ICON_NAME) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007185"><path d="${MOM_ICON_PATH}"/></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    const glyph = iconName.startsWith("emoji:")
      ? iconName.slice("emoji:".length)
      : LOCAL_CATEGORY_ICON_GLYPHS[iconName] || "🏷";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="17" text-anchor="middle" font-size="17">${glyph}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function getBundledIconSource(iconName, color = "#007185") {
    const bundledIcon = BUNDLED_ICON_DEFINITIONS.get(iconName);
    if (!bundledIcon) {
      return "";
    }

    const width = bundledIcon.width || 24;
    const height = bundledIcon.height || 24;
    const isTabler = bundledIcon.collectionPrefix === "tabler";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" color="${color}" fill="${isTabler ? "none" : "currentColor"}" stroke="${isTabler ? "currentColor" : "none"}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${bundledIcon.body}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function getProductPlaceholderIcon(data, product) {
    const category = getCategory(data, product?.department);
    const haystack = [
      product?.title,
      product?.description,
      product?.productType,
      product?.location,
      category?.name,
      product?.moq
    ].join(" ").toLocaleLowerCase();
    const match = PRODUCT_PLACEHOLDER_ICON_RULES.find((rule) => (
      rule.keywords.some((keyword) => haystack.includes(keyword))
    ));
    const iconName = match?.iconName || category?.iconName || "mdi:tag-outline";
    const source = getBundledIconSource(iconName) || getCategoryIconSource(category);

    return {
      source,
      label: iconName.split(":").pop().replace(/[-_]+/g, " ")
    };
  }


  function registerBundledIconCollection(collection) {
    if (!collection?.prefix || !collection?.icons) {
      return 0;
    }

    Object.entries(collection.icons).forEach(([name, definition]) => {
      if (definition?.body) {
        BUNDLED_ICON_DEFINITIONS.set(`${collection.prefix}:${name}`, {
          ...definition,
          collectionPrefix: collection.prefix
        });
      }
    });
    return BUNDLED_ICON_DEFINITIONS.size;
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

  function getRecentCommentCount(data, days = 7) {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    return getArray(data?.products).reduce((total, product) => (
      total + getArray(product?.comments).filter((comment) => Number(comment?.createdAt || 0) >= since).length
    ), 0);
  }

  function renderHeaderCommentBadges(data) {
    const showBadge = data?.settings?.showWeeklyCommentBadge !== false;
    const count = showBadge ? getRecentCommentCount(data, 7) : 0;
    document.querySelectorAll(".comments-header-button").forEach((button) => {
      let badge = button.querySelector(".weekly-comment-badge");
      if (!showBadge || count <= 0) {
        badge?.remove();
        button.setAttribute("aria-label", "Open comment trails");
        button.title = "Comments";
        return;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "weekly-comment-badge";
        button.append(badge);
      }
      badge.textContent = count > 99 ? "99+" : String(count);
      button.setAttribute("aria-label", `Open comment trails. ${count} comment${count === 1 ? "" : "s"} in the last week.`);
      button.title = `${count} comment${count === 1 ? "" : "s"} in the last week`;
    });
  }

  function appendCategoryCreateButton(container) {
    if (!container) return;
    const link = document.createElement("a");
    link.className = "category-create-button";
    link.href = "create-product.html";
    link.textContent = "+ Create Product";
    container.append(link);
  }

  function getTotalMoq(items) {
    return getArray(items).reduce((total, item) => total + Number(item.moq || item.effort || 0), 0);
  }

  function getTotalAmount(items) {
    return getArray(items).reduce((total, item) => {
      const price = Number(item.price || 0);
      return total + (Number.isFinite(price) ? price : 0);
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

  function formatDuration(value) {
    const seconds = Math.max(0, Math.round(Number(value) || 0));
    const totalDays = Math.floor(seconds / 86400);
    const totalMonths = Math.floor(totalDays / 30);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const days = totalDays % 30;
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;

    return [
      ...(years ? [`${years}y`] : []),
      ...(months ? [`${months}mo`] : []),
      ...(days ? [`${days}d`] : []),
      ...(hours ? [`${hours}h`] : []),
      ...(minutes ? [`${minutes}m`] : []),
      `${remainder}s`
    ].join(" ");
  }

  function formatMoney(value, settings = DEFAULT_SETTINGS) {
    const currency = ["USD", "INR", "EUR", "GBP", "JPY"].includes(settings?.currency)
      ? settings.currency
      : DEFAULT_SETTINGS.currency;
    const amount = Number(normalizeMoney(value));
    const locale = currency === "INR" ? "en-IN" : undefined;
    const money = new Intl.NumberFormat(locale, {
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

    return `${money} · ${formatDuration(amount / rate)}`;
  }

  function formatMoq(value) {
    return `MOQ ${normalizeMoq(value)}`;
  }

  function getUnitsInStock(product) {
    if (!product?.inStock) {
      return 0;
    }

    return Math.max(0, Number(product.availableUnits || 0) - Number(product.completedUnits || 0));
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

  function installPageLoadingSkeleton() {
    if (document.getElementById("page-loading-skeleton")) {
      return;
    }

    document.documentElement.classList.add("page-is-loading");
    const skeleton = document.createElement("div");
    skeleton.id = "page-loading-skeleton";
    skeleton.setAttribute("role", "status");
    skeleton.setAttribute("aria-label", "Loading page");
    skeleton.innerHTML = `
      <div class="skeleton-header"><i></i><i></i><i></i><i></i></div>
      <div class="skeleton-layout">
        <aside class="skeleton-sidebar"><i></i><i></i><i></i><i></i><i></i><i></i></aside>
        <main class="skeleton-main"><i class="wide"></i><i class="title"></i><i class="line"></i><i class="line short"></i><div class="skeleton-grid"><i></i><i></i><i></i><i></i><i></i><i></i></div></main>
      </div>`;
    document.body.append(skeleton);

    const dismiss = () => {
      skeleton.classList.add("is-ready");
      document.documentElement.classList.remove("page-is-loading");
      window.setTimeout(() => skeleton.remove(), 260);
    };

    window.addEventListener("load", () => window.setTimeout(dismiss, 650), { once: true });
    window.setTimeout(dismiss, 5000);
  }

  installPageLoadingSkeleton();

  function showCartLoadingIndicator() {
    if (document.querySelector(".cart-loading-overlay")) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "cart-loading-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `<div class="cart-loading-card"><strong>Loading the cart, please wait</strong><span class="cart-loading-bar" aria-hidden="true"><i></i></span></div>`;
    document.body.append(overlay);
  }

  document.addEventListener("click", (event) => {
    const cartButton = event.target.closest?.(".cart-button");
    if (!cartButton || cartButton.classList.contains("active-cart-page")) {
      return;
    }

    showCartLoadingIndicator();
    if (cartButton.matches("a[href]")) {
      event.preventDefault();
      window.setTimeout(() => {
        window.location.href = cartButton.href;
      }, 40);
    }
  }, true);

  globalThis.ToDoCartStore = {
    createCart,
    createCardImageCopy,
    createCategory,
    createId,
    createOrder,
    createProduct,
    createVendor,
    fileToDataUrl,
    formatDate,
    formatDateTime,
    formatDuration,
    formatMoney,
    formatMoq,
    getActiveCart,
    getCategory,
    getCategoryIconSource,
    getCategoryLabel,
    getExtensionUrl,
    getProductPlaceholderIcon,
    getPriorityLabel,
    getStars,
    getTotalAmount,
    getTotalMoq,
    getUnitsInStock,
    loadBackupHistory,
    loadBundledIconCollections,
    loadData,
    loadDemoState,
    normalizeCategory,
    normalizeData,
    normalizeMoq,
    normalizeMoney,
    normalizeProduct,
    normalizeVendor,
    setRelatedProductLinks,
    normalizeSettings,
    openExtensionPage,
    appendCategoryCreateButton,
    prepareCardImages,
    registerBundledIconCollection,
    renderCategory,
    renderHeaderCommentBadges,
    saveBackupHistory,
    saveData,
    saveDemoState,
    watchDataChanges
  };
})();
