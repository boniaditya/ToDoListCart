(function () {
  const Store = globalThis.ToDoCartStore;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const DEMO_DATA_VERSION = 2;
  const state = {
    data: Store.normalizeData({}),
    department: new URLSearchParams(window.location.search).get("department") || "all",
    priority: "all",
    location: "all",
    cartStatus: "all",
    wishlistStatus: document.body.dataset.view === "popup" ? "all" : "not-in-wishlist",
    archiveStatus: "not-archived",
    stockAvailability: "in-stock",
    priceMin: null,
    priceMax: null,
    timeMin: null,
    timeMax: null,
    isPopup: document.body.dataset.view === "popup",
    query: new URLSearchParams(window.location.search).get("q") || "",
    viewMode: document.body.dataset.view === "popup"
      ? "card"
      : (localStorage.getItem("todoListCart.productView") === "list" ? "list" : "card"),
    editProductId: null,
    formImages: [],
    referenceUrls: [],
    relationQuery: "",
    relationSelections: null,
    vendorQuery: "",
    selectedVendorIds: new Set(),
    currentPage: 1,
    pageSize: 12,
    isSavingProduct: false,
    wishlistPending: new Map(),
    wishlistSaveQueue: Promise.resolve()
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    productForm: document.querySelector("#product-form"),
    productPagination: document.querySelector("#product-pagination"),
    productsPerPage: document.querySelector("#products-per-page"),
    previousProductPage: document.querySelector("#previous-product-page"),
    nextProductPage: document.querySelector("#next-product-page"),
    productPageStatus: document.querySelector("#product-page-status"),
    titleInput: document.querySelector("#product-title"),
    descriptionInput: document.querySelector("#product-description"),
    locationInput: document.querySelector("#product-location"),
    locationSuggestions: document.querySelector("#product-location-suggestions"),
    departmentInput: document.querySelector("#product-department"),
    productTypeInputs: document.querySelectorAll("input[name='productType']"),
    priorityInputs: document.querySelectorAll("input[name='priority']"),
    moqInput: document.querySelector("#product-moq"),
    unitPriceInput: document.querySelector("#product-unit-price"),
    priceInput: document.querySelector("#product-price"),
    availableUnitsInput: document.querySelector("#product-available-units"),
    inStockInput: document.querySelector("#product-in-stock"),
    referenceUrlInput: document.querySelector("#product-reference-url"),
    addReferenceUrl: document.querySelector("#add-reference-url"),
    referenceUrlList: document.querySelector("#reference-url-list"),
    relationSearchInput: document.querySelector("#product-relation-search"),
    relatedProductsInput: document.querySelector("#product-related-products"),
    bundleProductsInput: document.querySelector("#product-bundle-products"),
    addonProductsInput: document.querySelector("#product-addon-products"),
    vendorSearchInput: document.querySelector("#product-vendor-search"),
    vendorsInput: document.querySelector("#product-vendors"),
    imageUrlInput: document.querySelector("#product-image-url"),
    imageFileInput: document.querySelector("#product-image-file"),
    imageDropzone: document.querySelector("#product-image-dropzone"),
    imagePreview: document.querySelector("#image-preview"),
    clearImage: document.querySelector("#clear-image"),
    createTitle: document.querySelector("#create-title"),
    formHeading: document.querySelector("#form-heading"),
    createSubmit: document.querySelector(".create-submit"),
    categoryNameInput: document.querySelector("#category-name"),
    addCategory: document.querySelector("#add-category"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#search-products"),
    departments: document.querySelector(".departments"),
    filterDepartment: document.querySelector("#filter-department"),
    filterPriority: document.querySelector("#filter-priority"),
    filterLocation: document.querySelector("#filter-location"),
    cartStatusFilter: document.querySelector(".cart-status-filter"),
    wishlistFilter: document.querySelector(".wishlist-filter"),
    archiveFilter: document.querySelector(".archive-filter"),
    stockFilter: document.querySelector(".stock-filter"),
    filterPriceMin: document.querySelector("#filter-price-min"),
    filterPriceMax: document.querySelector("#filter-price-max"),
    filterTimeMin: document.querySelector("#filter-time-min"),
    filterTimeMax: document.querySelector("#filter-time-max"),
    filterPriceMinOutput: document.querySelector("#filter-price-min-output"),
    filterPriceMaxOutput: document.querySelector("#filter-price-max-output"),
    filterTimeMinOutput: document.querySelector("#filter-time-min-output"),
    filterTimeMaxOutput: document.querySelector("#filter-time-max-output"),
    clearFilters: document.querySelector("#clear-filters"),
    productList: document.querySelector("#product-list"),
    viewButtons: document.querySelectorAll(".view-toggle-button"),
    cartList: document.querySelector("#cart-list"),
    productTemplate: document.querySelector("#product-template"),
    cartTemplate: document.querySelector("#cart-template"),
    emptyProducts: document.querySelector("#empty-products"),
    emptyCart: document.querySelector("#empty-cart"),
    productCount: document.querySelector("#product-count"),
    visibleCount: document.querySelector("#visible-count"),
    cartCount: document.querySelector("#cart-count"),
    cartSummary: document.querySelector("#cart-summary"),
    progressLabel: document.querySelector("#progress-label"),
    progressBar: document.querySelector("#progress-bar"),
    cartSelect: document.querySelector("#cart-select"),
    cartForm: document.querySelector("#cart-form"),
    cartNameInput: document.querySelector("#cart-name"),
    deleteCart: document.querySelector("#delete-cart"),
    clearDone: document.querySelector("#clear-done"),
    checkoutAll: document.querySelector("#checkout-all"),
    openFullTab: document.querySelector("#open-full-tab"),
    openProductsPage: document.querySelector("#open-products-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    openAccountPage: document.querySelector("#open-account-page"),
    cartJump: document.querySelector("#cart-jump"),
    cartPanel: document.querySelector("#cart-panel"),
    demoDataToggle: document.querySelector("#demo-data-toggle"),
    demoDataStatus: document.querySelector("#demo-data-status")
  };

  function demoImage(label, color, accent, symbol) {
    const safeLabel = String(label).replace(/[&<>"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="720" height="720" rx="48" fill="url(#g)"/><circle cx="560" cy="150" r="130" fill="white" opacity=".13"/><circle cx="135" cy="600" r="190" fill="white" opacity=".1"/><text x="360" y="330" text-anchor="middle" font-family="Arial,sans-serif" font-size="180">${symbol}</text><text x="360" y="520" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="white">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createDemoData() {
    const now = Date.now();
    const image = (label, color, accent, symbol) => [{ src: demoImage(label, color, accent, symbol), name: `${label} demo image` }];
    const products = [
      { id: "demo-product-launch", title: "Launch the portfolio site", department: "work", productType: "project", location: "Design studio", priority: "urgent", moq: "4", unitPrice: "30", price: "120", availableUnits: "4", completedUnits: 1, inStock: true, description: "Finish the responsive QA, publish the site, and share the launch note.", images: image("Portfolio launch", "#172554", "#2563eb", "🚀"), comments: [{ id: "demo-comment-1", title: "Review complete", text: "Mobile layouts are approved. The final accessibility pass is next.", createdAt: now - 86400000 }], relatedProductIds: ["demo-product-report"], bundleProductIds: ["demo-product-report"], addonProductIds: ["demo-product-focus"], createdAt: now - 604800000 },
      { id: "demo-product-groceries", title: "Pick up weekly groceries", department: "errands", productType: "product", location: "Green Market", priority: "important", moq: "8", unitPrice: "6.25", price: "50", availableUnits: "8", completedUnits: 0, inStock: true, description: "Fruit, vegetables, coffee, and ingredients for three quick dinners.", images: image("Weekly groceries", "#14532d", "#22c55e", "🛒"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 518400000 },
      { id: "demo-product-bike", title: "Book a bicycle service", department: "errands", productType: "service", location: "City Cycles", priority: "standard", moq: "1", unitPrice: "45", price: "45", availableUnits: "1", completedUnits: 0, inStock: true, description: "Schedule a tune-up and ask the mechanic to inspect the rear brake.", images: image("Bicycle service", "#7c2d12", "#f97316", "🚲"), comments: [{ id: "demo-comment-2", title: "Call ahead", text: "Saturday morning appointments usually fill up quickly.", createdAt: now - 172800000 }], relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 432000000 },
      { id: "demo-product-course", title: "Complete the analytics course", department: "study", productType: "project", location: "Online", priority: "important", moq: "6", unitPrice: "12", price: "72", availableUnits: "6", completedUnits: 2, inStock: true, description: "Watch modules four through six and submit the dashboard exercise.", images: image("Analytics course", "#4c1d95", "#a855f7", "📊"), relatedProductIds: ["demo-product-report"], bundleProductIds: [], addonProductIds: [], createdAt: now - 345600000 },
      { id: "demo-product-report", title: "Prepare the monthly report", department: "work", productType: "project", location: "Home office", priority: "urgent", moq: "3", unitPrice: "25", price: "75", availableUnits: "3", completedUnits: 0, inStock: true, description: "Combine sales, delivery, and customer notes into the leadership summary.", images: image("Monthly report", "#0f4c5c", "#06b6d4", "📈"), relatedProductIds: ["demo-product-launch", "demo-product-course"], bundleProductIds: [], addonProductIds: [], createdAt: now - 259200000 },
      { id: "demo-product-plants", title: "Repot the balcony plants", department: "home", productType: "product", location: "Balcony", priority: "standard", moq: "5", unitPrice: "4", price: "20", availableUnits: "5", completedUnits: 5, inStock: false, description: "Move the herbs into larger pots and refresh the soil.", images: image("Balcony plants", "#365314", "#84cc16", "🪴"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 172800000 },
      { id: "demo-product-focus", title: "Set up a focused work block", department: "work", productType: "service", location: "Home office", priority: "standard", moq: "1", unitPrice: "0", price: "0", availableUnits: "1", completedUnits: 0, inStock: true, description: "Silence notifications and reserve ninety minutes for uninterrupted work.", images: image("Focus block", "#1f2937", "#64748b", "⏱️"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 86400000 },
      { id: "demo-product-archived", title: "Compare old phone plans", department: "home", productType: "service", location: "Online", priority: "standard", moq: "1", unitPrice: "0", price: "0", availableUnits: "1", completedUnits: 1, inStock: false, archived: true, description: "A completed example kept in the archive for reference.", images: image("Phone plans", "#334155", "#94a3b8", "📱"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 1209600000 },
      { id: "demo-product-desk", title: "Organize the work desk", department: "home", productType: "project", location: "Study room", priority: "standard", moq: "3", unitPrice: "8", price: "24", availableUnits: "3", completedUnits: 0, inStock: true, description: "Sort cables, file loose papers, and create a clear space for focused work.", images: image("Organize desk", "#713f12", "#eab308", "🗂️"), relatedProductIds: ["demo-product-focus"], bundleProductIds: [], addonProductIds: [], createdAt: now - 82800000 },
      { id: "demo-product-dentist", title: "Schedule a dental checkup", department: "home", productType: "service", location: "Neighborhood clinic", priority: "important", moq: "1", unitPrice: "80", price: "80", availableUnits: "1", completedUnits: 0, inStock: true, description: "Book the next routine cleaning and add the appointment to the calendar.", images: image("Dental checkup", "#164e63", "#22d3ee", "🦷"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 79200000 },
      { id: "demo-product-presentation", title: "Rehearse the client presentation", department: "work", productType: "project", location: "Meeting room", priority: "urgent", moq: "2", unitPrice: "35", price: "70", availableUnits: "2", completedUnits: 0, inStock: true, description: "Run through the deck twice, tighten the opening, and prepare answers for likely questions.", images: image("Presentation", "#831843", "#ec4899", "🎤"), relatedProductIds: ["demo-product-launch", "demo-product-report"], bundleProductIds: [], addonProductIds: ["demo-product-focus"], createdAt: now - 75600000 },
      { id: "demo-product-library", title: "Return books to the library", department: "errands", productType: "product", location: "Central Library", priority: "important", moq: "3", unitPrice: "0", price: "0", availableUnits: "3", completedUnits: 0, inStock: true, description: "Return the three borrowed books before their due date and collect the reserved title.", images: image("Library books", "#7f1d1d", "#ef4444", "📚"), relatedProductIds: ["demo-product-course"], bundleProductIds: [], addonProductIds: [], createdAt: now - 72000000 },
      { id: "demo-product-mealprep", title: "Prepare weekday lunches", department: "home", productType: "product", location: "Kitchen", priority: "standard", moq: "5", unitPrice: "7", price: "35", availableUnits: "5", completedUnits: 0, inStock: true, description: "Cook and portion five simple lunches for the coming work week.", images: image("Weekday lunches", "#9a3412", "#fb923c", "🥗"), relatedProductIds: ["demo-product-groceries"], bundleProductIds: ["demo-product-groceries"], addonProductIds: [], createdAt: now - 68400000 },
      { id: "demo-product-language", title: "Practice Spanish vocabulary", department: "study", productType: "service", location: "Online", priority: "standard", moq: "4", unitPrice: "5", price: "20", availableUnits: "4", completedUnits: 1, inStock: true, description: "Complete four short vocabulary sessions and review the words missed last week.", images: image("Spanish practice", "#312e81", "#818cf8", "🗣️"), relatedProductIds: ["demo-product-course"], bundleProductIds: [], addonProductIds: [], createdAt: now - 64800000 },
      { id: "demo-product-laundry", title: "Drop off dry cleaning", department: "errands", productType: "service", location: "Main Street Cleaners", priority: "standard", moq: "4", unitPrice: "9", price: "36", availableUnits: "4", completedUnits: 0, inStock: true, description: "Drop off two jackets and two shirts, then save the collection receipt.", images: image("Dry cleaning", "#0c4a6e", "#38bdf8", "👔"), relatedProductIds: [], bundleProductIds: [], addonProductIds: [], createdAt: now - 61200000 },
      { id: "demo-product-budget", title: "Review the monthly budget", department: "home", productType: "project", location: "Home office", priority: "important", moq: "2", unitPrice: "20", price: "40", availableUnits: "2", completedUnits: 0, inStock: true, description: "Categorize recent expenses, check savings progress, and plan next month's limits.", images: image("Monthly budget", "#064e3b", "#10b981", "💰"), comments: [{ id: "demo-comment-3", title: "Statement ready", text: "The latest bank statement has been downloaded and is ready to review.", createdAt: now - 43200000 }], relatedProductIds: ["demo-product-report"], bundleProductIds: [], addonProductIds: [], createdAt: now - 57600000 }
    ];
    return Store.normalizeData({
      products,
      categories: [
        { id: "work", name: "Work", iconName: "mdi:briefcase-outline" },
        { id: "home", name: "Home", iconName: "mdi:home-outline" },
        { id: "errands", name: "Errands", iconName: "mdi:shopping-outline" },
        { id: "study", name: "Study", iconName: "mdi:book-open-page-variant-outline" }
      ],
      carts: [
        { id: "demo-cart-week", name: "This week", createdAt: now - 259200000, items: [{ id: "demo-item-1", productId: "demo-product-launch", done: false }, { id: "demo-item-2", productId: "demo-product-groceries", done: false }, { id: "demo-item-3", productId: "demo-product-bike", done: true }] },
        { id: "demo-cart-learning", name: "Learning goals", createdAt: now - 172800000, items: [{ id: "demo-item-4", productId: "demo-product-course", done: false }] }
      ],
      activeCartId: "demo-cart-week",
      wishlist: ["demo-product-course", "demo-product-focus"],
      orders: [{ id: "demo-order-1", cartId: "demo-cart-home", cartName: "Home refresh", createdAt: now - 604800000, items: [{ productId: "demo-product-plants", title: "Repot the balcony plants", department: "home", location: "Balcony", priority: "standard", moq: "5", unitPrice: "4", price: "20", description: "Move the herbs into larger pots and refresh the soil.", images: products[5].images, done: true }], totalMoq: "5", subtotalAmount: "20", discountAmount: "2", couponCode: "WELCOME10", totalAmount: "18" }],
      vendors: [{ id: "demo-vendor-1", name: "City Cycles", type: "business", phone: "+1 555 0142", email: "hello@example.com", website: "https://example.com", address: "12 Market Street", notes: "Friendly local repair shop; call before visiting.", productIds: ["demo-product-bike"], contacts: [{ id: "demo-spoc-1", name: "Alex", role: "Service desk", phone: "+1 555 0142", email: "alex@example.com" }], images: image("City Cycles", "#7c2d12", "#f97316", "🔧"), createdAt: now - 777600000 }],
      settings: { ...state.data.settings, accountName: "Demo Shopper", storeName: "ToDoList Cart Demo", currency: "USD", showTimeEquivalent: true, timeSeconds: "3600", timeRate: "25" }
    });
  }

  function renderDemoToggle(enabled) {
    if (!elements.demoDataToggle) return;
    elements.demoDataToggle.checked = enabled;
    elements.demoDataToggle.closest(".demo-data-toggle")?.classList.toggle("is-active", enabled);
    if (elements.demoDataStatus) elements.demoDataStatus.textContent = `Demo data is ${enabled ? "on" : "off"}`;
  }

  function showDemoLoadingSkeleton(requested) {
    document.querySelector("#demo-data-loading-skeleton")?.remove();
    const skeleton = document.createElement("div");
    skeleton.id = "demo-data-loading-skeleton";
    skeleton.setAttribute("role", "status");
    skeleton.setAttribute("aria-live", "polite");
    skeleton.setAttribute("aria-label", requested ? "Loading demo products" : "Restoring your products");
    skeleton.innerHTML = `
      <strong class="demo-skeleton-message">${requested ? "Loading demo products…" : "Restoring your products…"}</strong>
      <div class="skeleton-header"><i></i><i></i><i></i><i></i></div>
      <div class="skeleton-layout">
        <aside class="skeleton-sidebar"><i></i><i></i><i></i><i></i><i></i><i></i></aside>
        <main class="skeleton-main"><i class="wide"></i><i class="title"></i><i class="line"></i><i class="line short"></i><div class="skeleton-grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></main>
      </div>`;
    document.body.append(skeleton);
    return skeleton;
  }

  async function waitForRenderedProductImages() {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const images = [...document.querySelectorAll("#product-list img")];
    await Promise.race([
      Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      })),
      new Promise((resolve) => window.setTimeout(resolve, 4000))
    ]);
  }

  function dismissDemoLoadingSkeleton(skeleton) {
    if (!skeleton?.isConnected) return;
    skeleton.classList.add("is-ready");
    window.setTimeout(() => skeleton.remove(), 260);
  }

  async function toggleDemoData() {
    if (!elements.demoDataToggle) return;
    const label = elements.demoDataToggle.closest(".demo-data-toggle");
    const requested = elements.demoDataToggle.checked;
    const loadingStartedAt = performance.now();
    const skeleton = showDemoLoadingSkeleton(requested);
    elements.demoDataToggle.disabled = true;
    label?.classList.add("is-busy");
    try {
      const demoState = await Store.loadDemoState();
      if (requested) {
        const originalData = demoState.enabled ? demoState.originalData : state.data;
        await Store.saveDemoState({ enabled: true, version: DEMO_DATA_VERSION, originalData });
        state.data = await Store.saveData(createDemoData());
      } else {
        state.data = await Store.saveData(demoState.originalData || Store.normalizeData({}));
        await Store.saveDemoState({ enabled: false, version: DEMO_DATA_VERSION, originalData: null });
      }
      renderDemoToggle(requested);
      render();
      await waitForRenderedProductImages();
      const minimumSkeletonTime = 500;
      const remainingTime = minimumSkeletonTime - (performance.now() - loadingStartedAt);
      if (remainingTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingTime));
      }
    } catch (error) {
      console.error("Unable to toggle demo data.", error);
      renderDemoToggle(!requested);
    } finally {
      elements.demoDataToggle.disabled = false;
      label?.classList.remove("is-busy");
      dismissDemoLoadingSkeleton(skeleton);
    }
  }

  function ensureProductSaveStatus() {
    if (!elements.productForm || !elements.createSubmit) {
      return null;
    }

    let status = elements.productForm.querySelector(".product-save-status");

    if (status) {
      return status;
    }

    status = document.createElement("div");
    status.className = "product-save-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;

    const spinner = document.createElement("span");
    const message = document.createElement("strong");
    const progress = document.createElement("span");
    const progressBar = document.createElement("i");

    spinner.className = "product-save-spinner";
    spinner.setAttribute("aria-hidden", "true");
    message.className = "product-save-message";
    message.textContent = "Saving product...";
    progress.className = "product-save-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.append(progressBar);
    status.append(spinner, message, progress);
    elements.createSubmit.insertAdjacentElement("afterend", status);
    return status;
  }

  function setProductSaving(isSaving, message = "Saving product...") {
    const status = ensureProductSaveStatus();
    const skeleton = document.querySelector("#product-save-skeleton");

    state.isSavingProduct = Boolean(isSaving);
    if (skeleton) {
      skeleton.hidden = !isSaving;
      skeleton.setAttribute("aria-busy", String(Boolean(isSaving)));
    }

    if (elements.createSubmit) {
      elements.createSubmit.disabled = Boolean(isSaving);
      elements.createSubmit.setAttribute("aria-busy", String(Boolean(isSaving)));
      elements.createSubmit.textContent = isSaving
        ? message
        : (state.editProductId ? "Save Changes" : "Create Product");
    }

    if (status) {
      status.hidden = !isSaving;
      const messageElement = status.querySelector(".product-save-message");

      if (messageElement) {
        messageElement.textContent = message;
      }
    }
  }

  function getCardSettings() {
    const settings = state.data.settings;
    const prefix = state.isPopup ? "popup" : "listing";
    return {
      showImages: settings[prefix + "ShowImages"],
      compactMode: settings[prefix + "CompactMode"],
      showProductDescriptions: settings[prefix + "ShowProductDescriptions"],
      showDeliveryStatus: settings[prefix + "ShowDeliveryStatus"],
      showLocationIcon: settings[prefix + "ShowLocationIcon"],
      showTimeIcon: settings[prefix + "ShowTimeIcon"],
      showPrice: settings[prefix + "ShowPrice"],
      showTime: settings[prefix + "ShowTime"],
      showCategory: settings[prefix + "ShowCategory"],
      showLocation: settings[prefix + "ShowLocation"],
      showRatings: settings[prefix + "ShowRatings"],
      showMoq: settings[prefix + "ShowMoq"],
      showUnits: settings[prefix + "ShowUnits"]
    };
  }

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function getActiveItems() {
    return getActiveCart().items;
  }

  function getProduct(productId) {
    return state.data.products.find((product) => product.id === productId);
  }

  function getPriorityValue() {
    return [...elements.priorityInputs].find((input) => input.checked)?.value || "standard";
  }

  function getProductTypeValue() {
    return [...elements.productTypeInputs].find((input) => input.checked)?.value || "product";
  }

  function setProductTypeValue(productType) {
    elements.productTypeInputs.forEach((input) => {
      input.checked = input.value === productType;
    });
  }

  function setPriorityValue(priority) {
    elements.priorityInputs.forEach((input) => {
      input.checked = input.value === priority;
    });
  }

  function getCategoryName(product) {
    return Store.getCategoryLabel(state.data, product.department);
  }

  function createWishlistIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    icon.classList.add("wishlist-icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    path.setAttribute("d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z");
    icon.append(path);
    return icon;
  }

  function cartHasProduct(productId) {
    return getActiveItems().some((item) => item.productId === productId);
  }

  function setActiveCart(nextCart) {
    state.data.carts = state.data.carts.map((cart) => (
      cart.id === nextCart.id ? nextCart : cart
    ));
  }

  function getVisibleProducts() {
    const query = state.query.toLowerCase();

    return state.data.products.filter((product) => {
      const categoryName = getCategoryName(product);
      const matchesDepartment = state.department === "all" || product.department === state.department;
      const matchesPriority = state.priority === "all" || product.priority === state.priority;
      const matchesLocation = state.location === "all" || product.location === state.location;
      const isInCart = cartHasProduct(product.id);
      const matchesCartStatus = state.cartStatus === "all"
        || (state.cartStatus === "in-cart" && isInCart)
        || (state.cartStatus === "not-in-cart" && !isInCart);
      const isWishlisted = state.data.wishlist.includes(product.id);
      const matchesWishlistStatus = state.wishlistPending.has(product.id)
        || state.wishlistStatus === "all"
        || (state.wishlistStatus === "in-wishlist" && isWishlisted)
        || (state.wishlistStatus === "not-in-wishlist" && !isWishlisted);
      const matchesArchiveStatus = state.archiveStatus === "all"
        || (state.archiveStatus === "archived" && product.archived)
        || (state.archiveStatus === "not-archived" && !product.archived);
      const matchesStockAvailability = state.stockAvailability === "all"
        || (state.stockAvailability === "in-stock" && product.inStock)
        || (state.stockAvailability === "out-of-stock" && !product.inStock);
      const price = Number(product.price);
      const time = getTimeEquivalentSeconds(price);
      const matchesPrice = (state.priceMin === null || price >= state.priceMin)
        && (state.priceMax === null || price <= state.priceMax);
      const matchesTime = (state.timeMin === null || time >= state.timeMin)
        && (state.timeMax === null || time <= state.timeMax);
      const matchesQuery = !query || [
        product.title,
        categoryName,
        product.priority,
        product.location,
        product.description,
        product.moq,
        product.price
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesDepartment && matchesPriority && matchesLocation && matchesCartStatus && matchesWishlistStatus
        && matchesArchiveStatus
        && matchesStockAvailability && matchesPrice && matchesTime && matchesQuery;
    });
  }

  function getTimeEquivalentSeconds(price) {
    const rate = Number(state.data.settings.timeRate) / Number(state.data.settings.timeSeconds || 1);
    return rate > 0 ? Number(price) / rate : 0;
  }

  function formatDuration(seconds) {
    return Store.formatDuration(seconds);
  }

  function renderRangeFilters() {
    if (!elements.filterPriceMin || !elements.filterPriceMax || !elements.filterTimeMin || !elements.filterTimeMax) {
      return;
    }

    const prices = state.data.products.map((product) => Number(product.price) || 0);
    const times = prices.map(getTimeEquivalentSeconds);
    const priceMaximum = Math.max(1, Math.ceil(Math.max(...prices, 0)));
    const timeMaximum = Math.max(1, Math.ceil(Math.max(...times, 0)));
    const setRange = (minInput, maxInput, minOutput, maxOutput, minimum, maximum, formatter, minValue, maxValue) => {
      const track = minInput.closest(".range-track");
      const references = track.parentElement.querySelectorAll(".range-reference output");
      const selectedMinimum = minValue ?? minimum;
      const selectedMaximum = maxValue ?? maximum;
      minInput.max = String(maximum);
      maxInput.max = String(maximum);
      minInput.value = String(selectedMinimum);
      maxInput.value = String(selectedMaximum);
      minOutput.textContent = minValue === null ? "Any" : formatter(minValue);
      maxOutput.textContent = maxValue === null ? "Any" : formatter(maxValue);
      track.style.setProperty("--range-min", `${((selectedMinimum - minimum) / (maximum - minimum)) * 100}%`);
      track.style.setProperty("--range-max", `${((selectedMaximum - minimum) / (maximum - minimum)) * 100}%`);
      references[0].textContent = formatter(minimum);
      references[1].textContent = formatter((minimum + maximum) / 2);
      references[2].textContent = formatter(maximum);
    };
    const moneySettings = { ...state.data.settings, showTimeEquivalent: false };

    setRange(elements.filterPriceMin, elements.filterPriceMax, elements.filterPriceMinOutput, elements.filterPriceMaxOutput, 0, priceMaximum, (value) => Store.formatMoney(value, moneySettings), state.priceMin, state.priceMax);
    setRange(elements.filterTimeMin, elements.filterTimeMax, elements.filterTimeMinOutput, elements.filterTimeMaxOutput, 0, timeMaximum, formatDuration, state.timeMin, state.timeMax);
  }

  function renderStockFilter() {
    elements.stockFilter?.querySelectorAll("button[data-stock]").forEach((button) => {
      const active = button.dataset.stock === state.stockAvailability;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderCartStatusFilter() {
    elements.cartStatusFilter?.querySelectorAll("button[data-cart-status]").forEach((button) => {
      const active = button.dataset.cartStatus === state.cartStatus;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderWishlistFilter() {
    elements.wishlistFilter?.querySelectorAll("button[data-wishlist-status]").forEach((button) => {
      const active = button.dataset.wishlistStatus === state.wishlistStatus;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function showWishlistSaving(card, action, title) {
    if (!card) return;
    const imageBox = card.querySelector(".product-image");
    const button = imageBox?.querySelector(".wishlist-button");
    if (!imageBox || !button) return;
    const message = action === "adding" ? "Adding to wishlist..." : "Removing from wishlist...";
    const status = document.createElement("div");
    const heart = document.createElement("b");
    const label = document.createElement("small");
    status.className = "wishlist-saving-status";
    status.setAttribute("role", "status");
    heart.textContent = "♥";
    heart.setAttribute("aria-hidden", "true");
    label.textContent = message;
    status.append(heart, label);
    imageBox.querySelector(".wishlist-saving-status")?.remove();
    imageBox.append(status);
    card.classList.add("wishlist-saving");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-label", `${message} ${title}`);
  }

  function renderArchiveFilter() {
    elements.archiveFilter?.querySelectorAll("button[data-archive-status]").forEach((button) => {
      const active = button.dataset.archiveStatus === state.archiveStatus;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function fitCardImage(image) {
    const fit = () => {
      const frame = image.closest(".product-carousel-slide") || image.closest(".product-image");

      if (!frame?.clientWidth || !frame.clientHeight || !image.naturalWidth || !image.naturalHeight) {
        return;
      }

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const frameRatio = frame.clientWidth / frame.clientHeight;
      const fillWidth = imageRatio >= frameRatio;

      image.style.setProperty("width", fillWidth ? "100%" : "auto", "important");
      image.style.setProperty("height", fillWidth ? "auto" : "100%", "important");
      image.style.setProperty("max-width", "100%", "important");
      image.style.setProperty("max-height", "100%", "important");
    };

    image.addEventListener("load", () => requestAnimationFrame(fit), { once: true });
    if (image.complete) {
      requestAnimationFrame(fit);
    }
  }

  function renderProductImage(container, product, isWishlisted) {
    container.replaceChildren();
    const images = product.images || [];

    if (images.length && getCardSettings().showImages) {
      if (images.length > 1 && !state.isPopup) {
        const track = document.createElement("div");
        const previous = document.createElement("button");
        const next = document.createElement("button");
        const dots = document.createElement("div");

        track.className = "product-carousel-track";
        images.forEach((entry, index) => {
          const slide = document.createElement("div");
          const image = document.createElement("img");

          slide.className = "product-carousel-slide";
          image.src = entry.cardSrc || entry.src;
          image.alt = `${product.title} product image ${index + 1} of ${images.length}`;
          fitCardImage(image);
          slide.append(image);
          track.append(slide);
        });

        previous.type = "button";
        previous.className = "carousel-button previous";
        previous.dataset.carouselDirection = "-1";
        previous.setAttribute("aria-label", `Show previous image for ${product.title}`);
        previous.textContent = "‹";
        next.type = "button";
        next.className = "carousel-button next";
        next.dataset.carouselDirection = "1";
        next.setAttribute("aria-label", `Show next image for ${product.title}`);
        next.textContent = "›";

        dots.className = "carousel-dots";
        images.forEach((_, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "carousel-dot";
          dot.dataset.carouselIndex = String(index);
          dot.setAttribute("aria-label", `Show image ${index + 1} of ${images.length} for ${product.title}`);
          dot.setAttribute("aria-current", String(index === 0));
          dots.append(dot);
        });

        container.dataset.imageIndex = "0";
        container.append(track, previous, next, dots);
      } else {
        const image = document.createElement("img");
        image.src = images[0].cardSrc || images[0].src;
        image.alt = `${product.title} product image`;
        fitCardImage(image);
        container.append(image);
      }
    } else {
      container.append(document.createElement("span"));
    }

    const wishlistButton = document.createElement("button");
    wishlistButton.type = "button";
    wishlistButton.className = "wishlist-button";
    wishlistButton.setAttribute("aria-label", isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`);
    wishlistButton.setAttribute("aria-pressed", String(isWishlisted));
    wishlistButton.append(createWishlistIcon());
    container.append(wishlistButton);

  }

  function setCarouselImage(container, index) {
    if (!container) {
      return;
    }

    const product = state.data.products.find((entry) => entry.id === container.closest(".product-card")?.dataset.id);
    const images = product?.images || [];
    if (images.length < 2) {
      return;
    }

    container.dataset.imageIndex = String(index);
    container.querySelector(".product-carousel-track").style.transform = `translateX(-${index * 100}%)`;
    container.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", String(active));
    });
  }

  function moveCarousel(button) {
    const container = button.closest(".product-image");
    const product = state.data.products.find((entry) => entry.id === button.closest(".product-card")?.dataset.id);
    const images = product?.images || [];
    const nextIndex = (Number(container?.dataset.imageIndex || 0) + Number(button.dataset.carouselDirection || 1) + images.length) % images.length;

    if (images.length > 1) {
      setCarouselImage(container, nextIndex);
    }
  }

  function renderImagePreview() {
    if (!elements.imagePreview) {
      return;
    }

    const previewGrid = elements.imagePreview.querySelector(".image-preview-grid");
    const imageUrl = elements.imageUrlInput?.value.trim() || "";
    const images = [
      ...(imageUrl ? [{ src: imageUrl, name: "Image URL" }] : []),
      ...state.formImages
    ];

    elements.imagePreview.hidden = images.length === 0;
    previewGrid?.replaceChildren();

    images.forEach((entry, index) => {
      const previewItem = document.createElement("div");
      const removeButton = document.createElement("button");
      const orderControls = document.createElement("div");
      const moveLeft = document.createElement("button");
      const moveRight = document.createElement("button");
      const image = document.createElement("img");

      previewItem.className = "image-preview-item";
      image.src = entry.src;
      image.alt = entry.name || `Selected product image ${index + 1}`;
      orderControls.className = "image-order-controls";
      moveLeft.type = "button";
      moveLeft.className = "move-image-button";
      moveLeft.dataset.imageIndex = String(index);
      moveLeft.dataset.imageDirection = "-1";
      moveLeft.disabled = index === 0;
      moveLeft.setAttribute("aria-label", `Move image ${index + 1} left`);
      moveLeft.title = "Move left";
      moveLeft.textContent = "‹";
      moveRight.type = "button";
      moveRight.className = "move-image-button";
      moveRight.dataset.imageIndex = String(index);
      moveRight.dataset.imageDirection = "1";
      moveRight.disabled = index === images.length - 1;
      moveRight.setAttribute("aria-label", `Move image ${index + 1} right`);
      moveRight.title = "Move right";
      moveRight.textContent = "›";
      removeButton.type = "button";
      removeButton.className = "remove-image-button";
      removeButton.dataset.imageIndex = String(index);
      removeButton.setAttribute("aria-label", `Remove image ${index + 1}`);
      removeButton.title = `Remove image ${index + 1}`;
      removeButton.textContent = "×";
      orderControls.append(moveLeft, moveRight);
      previewItem.append(image, orderControls, removeButton);
      previewGrid?.append(previewItem);
    });

    if (elements.imageDropzone) {
      elements.imageDropzone.classList.toggle("has-image", images.length > 0);
      elements.imageDropzone.textContent = images.length
        ? `${images.length} image${images.length === 1 ? "" : "s"} ready. Drop or paste more to add them.`
        : "Drop images here or paste from clipboard";
    }
  }

  function renderCategoryControls() {
    if (elements.departments) {
      elements.departments.replaceChildren();

      const allButton = document.createElement("button");
      allButton.type = "button";
      allButton.dataset.department = "all";
      allButton.textContent = "All";
      elements.departments.append(allButton);

      state.data.categories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.department = category.id;
        Store.renderCategory(button, state.data, category.id);
        elements.departments.append(button);
      });

      if (state.department !== "all" && !state.data.categories.some((category) => category.id === state.department)) {
        state.department = "all";
      }

      elements.departments.querySelectorAll("button").forEach((button) => {
        const active = button.dataset.department === state.department;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (!state.isPopup) {
        Store.appendCategoryCreateButton(elements.departments);
      }
    }

    if (elements.departmentInput) {
      const currentValue = elements.departmentInput.value || state.data.settings.defaultDepartment;
      elements.departmentInput.replaceChildren();

      state.data.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        elements.departmentInput.append(option);
      });

      elements.departmentInput.value = state.data.categories.some((category) => category.id === currentValue)
        ? currentValue
        : state.data.settings.defaultDepartment;
    }

    if (elements.filterDepartment) {
      elements.filterDepartment.replaceChildren();

      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "All categories";
      elements.filterDepartment.append(allOption);

      state.data.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        elements.filterDepartment.append(option);
      });

      elements.filterDepartment.value = state.department;
    }
  }

  function renderLocationOptions() {
    if (!elements.filterLocation) {
      return;
    }

    const locations = [...new Set(state.data.products.map((product) => product.location))]
      .sort((first, second) => first.localeCompare(second));
    elements.filterLocation.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All locations";
    elements.filterLocation.append(allOption);

    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      elements.filterLocation.append(option);
    });

    if (state.location !== "all" && !locations.includes(state.location)) {
      state.location = "all";
    }

    elements.filterLocation.value = state.location;
  }

  function renderLocationSuggestions() {
    if (!elements.locationSuggestions) {
      return;
    }

    const locations = [...new Set(state.data.products
      .map((product) => product.location)
      .filter((location) => location && location !== "Unspecified"))]
      .sort((first, second) => first.localeCompare(second));

    elements.locationSuggestions.replaceChildren();
    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      elements.locationSuggestions.append(option);
    });
  }

  function renderProductRelationOptions() {
    const currentId = state.editProductId;
    const current = state.data.products.find((product) => product.id === currentId);
    const selected = state.relationSelections || {
      related: current?.relatedProductIds || [],
      bundle: current?.bundleProductIds || [],
      addons: current?.addonProductIds || []
    };
    state.relationSelections = {
      related: [...selected.related],
      bundle: [...selected.bundle],
      addons: [...(selected.addons || [])]
    };
    const query = state.relationQuery.toLocaleLowerCase();
    const renderOptions = (select, selectedIds) => {
      if (!select) return;
      select.replaceChildren();
      state.data.products
        .filter((product) => product.id !== currentId)
        .filter((product) => !query || product.title.toLocaleLowerCase().includes(query) || selectedIds.includes(product.id))
        .forEach((product) => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.title;
        option.selected = selectedIds.includes(product.id);
        select.append(option);
      });
    };
    renderOptions(elements.relatedProductsInput, state.relationSelections.related);
    renderOptions(elements.bundleProductsInput, state.relationSelections.bundle);
    renderOptions(elements.addonProductsInput, state.relationSelections.addons);
  }

  function syncRelationSelection(select, key) {
    if (!select || !state.relationSelections) {
      return;
    }

    state.relationSelections[key] = [...select.selectedOptions].map((option) => option.value);
  }

  function syncVendorSelection() {
    if (!elements.vendorsInput) {
      return;
    }

    elements.vendorsInput.querySelectorAll("option").forEach((option) => {
      if (option.selected) {
        state.selectedVendorIds.add(option.value);
      } else {
        state.selectedVendorIds.delete(option.value);
      }
    });
  }

  function renderVendorOptions() {
    if (!elements.vendorsInput) {
      return;
    }

    const query = state.vendorQuery.toLocaleLowerCase();
    const vendors = state.data.vendors
      .slice()
      .filter((vendor) => !query || [
        vendor.name,
        vendor.type,
        vendor.phone,
        vendor.email,
        vendor.website,
        vendor.address,
        vendor.notes
      ].some((value) => String(value || "").toLocaleLowerCase().includes(query)) || state.selectedVendorIds.has(vendor.id))
      .sort((first, second) => first.name.localeCompare(second.name));

    elements.vendorsInput.replaceChildren();

    if (!vendors.length) {
      const empty = document.createElement("option");
      empty.disabled = true;
      empty.textContent = "No matching vendors";
      elements.vendorsInput.append(empty);
      return;
    }

    vendors.forEach((vendor) => {
      const option = document.createElement("option");
      option.value = vendor.id;
      option.textContent = `${vendor.name}${vendor.type ? ` — ${vendor.type}` : ""}`;
      option.selected = state.selectedVendorIds.has(vendor.id);
      if (option.selected) {
        state.selectedVendorIds.add(vendor.id);
      }
      elements.vendorsInput.append(option);
    });
  }

  function updateProductVendors(productId, selectedVendorIds) {
    const selected = new Set(selectedVendorIds);
    state.data.vendors = state.data.vendors.map((vendor) => {
      const productIds = new Set(vendor.productIds || []);
      if (selected.has(vendor.id)) {
        productIds.add(productId);
      } else {
        productIds.delete(productId);
      }
      return Store.normalizeVendor({
        ...vendor,
        productIds: [...productIds],
        updatedAt: Date.now()
      }, new Set(state.data.products.map((product) => product.id)));
    });
  }

  function renderCartSelector() {
    if (!elements.cartSelect) {
      return;
    }

    elements.cartSelect.replaceChildren();

    state.data.carts.forEach((cart) => {
      const option = document.createElement("option");
      option.value = cart.id;
      option.textContent = cart.name;
      elements.cartSelect.append(option);
    });

    elements.cartSelect.value = state.data.activeCartId;

    if (elements.deleteCart) {
      elements.deleteCart.disabled = state.data.carts.length <= 1;
    }
  }

  function updateSummary() {
    const activeCart = getActiveCart();
    const cartProducts = getActiveItems()
      .map((item) => ({ item, product: getProduct(item.productId) }))
      .filter((entry) => entry.product);
    const done = cartProducts.filter((entry) => entry.item.done).length;
    const open = cartProducts.length - done;
    const total = Store.getTotalAmount(cartProducts.map((entry) => entry.product));
    const progress = cartProducts.length === 0 ? 0 : Math.round((done / cartProducts.length) * 100);

    if (elements.productCount) {
      const activeProductCount = state.data.products.filter((product) => !product.archived).length;
      elements.productCount.textContent = pluralize(activeProductCount, "product", "products");
    }

    if (elements.cartCount) {
      elements.cartCount.textContent = cartProducts.length;
    }

    if (elements.cartSummary) {
      elements.cartSummary.textContent = `${activeCart.name}: ${open} open | ${Store.formatMoney(total, state.data.settings)}`;
    }

    if (elements.progressLabel) {
      elements.progressLabel.textContent = `${progress}%`;
    }

    if (elements.progressBar) {
      elements.progressBar.style.width = `${progress}%`;
    }

    if (elements.checkoutAll) {
      elements.checkoutAll.disabled = open === 0;
    }

    if (elements.clearDone) {
      elements.clearDone.disabled = done === 0;
    }
  }

  function renderProducts() {
    if (!elements.productList || !elements.productTemplate) {
      return;
    }

    const visibleProducts = getVisibleProducts();
    const totalPages = Math.max(1, Math.ceil(visibleProducts.length / state.pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const pageStart = (state.currentPage - 1) * state.pageSize;
    const productsOnPage = elements.productPagination
      ? visibleProducts.slice(pageStart, pageStart + state.pageSize)
      : visibleProducts;
    elements.productList.replaceChildren();

    productsOnPage.forEach((product) => {
      const node = elements.productTemplate.content.firstElementChild.cloneNode(true);
      const imageBox = node.querySelector(".product-image");
      const title = node.querySelector(".product-title");
      const description = node.querySelector(".product-description");
      const stars = node.querySelector(".rating-stars");
      const ratingRow = node.querySelector(".rating-row");
      const priority = node.querySelector(".priority-label");
      const department = node.querySelector(".department-label");
      const location = node.querySelector(".location-label");
      const locationValue = node.querySelector(".location-value");
      const moq = node.querySelector(".moq-label");
      const units = node.querySelector(".units-label");
      const price = node.querySelector(".price-label");
      const time = node.querySelector(".time-label");
      const timeValue = node.querySelector(".time-value");
      const commentButton = node.querySelector(".comment-count-button");
      const commentCount = node.querySelector(".comment-count-value");
      const stockStatus = node.querySelector(".stock-status");
      const addButton = node.querySelector(".add-cart-button");
      const buyNowButton = node.querySelector(".buy-now-button");

      node.dataset.id = product.id;
      node.classList.toggle("out-of-stock", !product.inStock);
      node.tabIndex = 0;
      node.setAttribute("role", "link");
      node.setAttribute("aria-label", `View details for ${product.title}`);
      node.classList.toggle("done", getActiveItems().some((item) => item.productId === product.id && item.done));
      const isWishlisted = state.data.wishlist.includes(product.id);
      renderProductImage(imageBox, product, isWishlisted);
      const wishlistAction = state.wishlistPending.get(product.id);
      if (wishlistAction) showWishlistSaving(node, wishlistAction, product.title);
      title.textContent = product.title;
      if (description) {
        description.textContent = product.description || "No additional details provided.";
      }
      stars.textContent = Store.getStars(product.priority);
      ratingRow.hidden = !getCardSettings().showRatings;
      priority.textContent = Store.getPriorityLabel(product.priority);
      ratingRow.dataset.priority = priority.textContent;
      ratingRow.setAttribute("aria-label", `Priority: ${priority.textContent}`);
      ratingRow.tabIndex = 0;
      Store.renderCategory(department, state.data, product.department);
      department.hidden = !getCardSettings().showCategory;
      department.dataset.department = product.department;
      department.setAttribute("aria-label", "Show " + Store.getCategoryLabel(state.data, product.department) + " products");
      locationValue.textContent = product.location;
      location.hidden = !getCardSettings().showLocation;
      location.dataset.location = product.location;
      location.setAttribute("aria-label", "Show products in " + product.location);
      location.querySelector(".location-card-icon").hidden = !getCardSettings().showLocationIcon;
      moq.textContent = Store.formatMoq(product.moq);
      moq.hidden = !getCardSettings().showMoq;
      const unitsInStock = Store.getUnitsInStock(product);
      units.textContent = `${unitsInStock} ${unitsInStock === 1 ? "unit" : "units"}`;
      units.hidden = !getCardSettings().showUnits;
      const [money, duration] = Store.formatMoney(product.price, state.data.settings).split(" · ");
      price.textContent = `Total ${money}`;
      price.hidden = !getCardSettings().showPrice;
      time.hidden = !duration || !getCardSettings().showTime;
      timeValue.textContent = duration || "";
      time.querySelector(".time-card-icon").hidden = !getCardSettings().showTimeIcon;
      commentCount.textContent = String(product.comments.length);
      commentButton.setAttribute("aria-label", `Open ${product.comments.length} ${product.comments.length === 1 ? "comment" : "comments"} for ${product.title}`);
      commentButton.title = `${product.comments.length} ${product.comments.length === 1 ? "comment" : "comments"}`;
      stockStatus.hidden = product.inStock;

      if (!product.inStock) {
        addButton.textContent = "Out of stock";
        addButton.disabled = true;
        addButton.classList.add("out-of-stock");
        buyNowButton.disabled = true;
      } else if (cartHasProduct(product.id)) {
        addButton.textContent = "In Cart";
        addButton.classList.add("in-cart");
        addButton.disabled = true;
      }

      elements.productList.append(node);
    });

    if (elements.visibleCount) {
      elements.visibleCount.textContent = `${visibleProducts.length} shown`;
    }

    if (elements.emptyProducts) {
      elements.emptyProducts.hidden = visibleProducts.length > 0;
    }

    if (elements.productPagination) {
      const hasProducts = visibleProducts.length > 0;
      elements.productPagination.hidden = !hasProducts;
      elements.productsPerPage.value = String(state.pageSize);
      elements.previousProductPage.disabled = state.currentPage <= 1;
      elements.nextProductPage.disabled = state.currentPage >= totalPages;
      elements.productPageStatus.textContent = `Page ${state.currentPage} of ${totalPages}`;
    }
  }

  function resetProductPage() {
    state.currentPage = 1;
  }

  function renderCart() {
    if (!elements.cartList || !elements.cartTemplate) {
      return;
    }

    const cartEntries = getActiveItems()
      .map((item) => ({ item, product: getProduct(item.productId) }))
      .filter((entry) => entry.product);
    elements.cartList.replaceChildren();

    cartEntries.forEach(({ item, product }) => {
      const node = elements.cartTemplate.content.firstElementChild.cloneNode(true);
      const checkbox = node.querySelector("input");
      const imageBox = node.querySelector(".cart-product-image");
      const title = node.querySelector(".cart-copy strong");
      const meta = node.querySelector(".cart-copy span");
      const moveWishlist = node.querySelector(".cart-move-wishlist");
      const removeButton = node.querySelector(".remove-cart-button");

      node.dataset.productId = product.id;
      node.classList.toggle("done", item.done);
      checkbox.checked = item.done;
      checkbox.setAttribute("aria-label", `Mark ${product.title} as ${item.done ? "open" : "checked out"}`);
      imageBox.replaceChildren();
      if (product.image && getCardSettings().showImages) {
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = `${product.title} product image`;
        imageBox.append(image);
      } else {
        imageBox.append(document.createElement("span"));
      }
      title.textContent = product.title;
      if (meta) {
        meta.remove();
      }
      moveWishlist.setAttribute("aria-label", `Move ${product.title} from cart to wishlist`);
      removeButton.setAttribute("aria-label", `Remove ${product.title} from cart`);
      node.tabIndex = 0;
      node.setAttribute("role", "link");
      node.setAttribute("aria-label", `Open ${product.title} product page`);

      elements.cartList.append(node);
    });

    if (elements.emptyCart) {
      elements.emptyCart.hidden = cartEntries.length > 0;
    }
  }

  function renderSettings() {
    if (elements.brandName) {
      elements.brandName.textContent = state.data.settings.storeName;
    }
    Store.renderHeaderCommentBadges(state.data);

    const cardSettings = getCardSettings();
    document.body.classList.toggle("compact-mode", cardSettings.compactMode);
    document.body.classList.toggle("hide-product-descriptions", !cardSettings.showProductDescriptions);
    document.body.classList.toggle("hide-delivery-status", !cardSettings.showDeliveryStatus);
  }

  function render() {
    if (elements.searchInput && elements.searchInput.value !== state.query) {
      elements.searchInput.value = state.query;
    }
    renderSettings();
    renderCategoryControls();
    renderLocationOptions();
    renderLocationSuggestions();
    renderProductRelationOptions();
    renderVendorOptions();
    renderCartSelector();
    renderRangeFilters();
    renderStockFilter();
    renderCartStatusFilter();
    renderWishlistFilter();
    renderArchiveFilter();
    renderProducts();
    renderCart();
    renderImagePreview();
    updateSummary();
    renderViewMode();
  }

  function renderViewMode() {
    if (!elements.productList) {
      return;
    }

    elements.productList.classList.toggle("list-view", state.viewMode === "list");
    elements.productList.classList.toggle("card-view", state.viewMode === "card");
    elements.viewButtons.forEach((button) => {
      const active = button.dataset.view === state.viewMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setViewMode(viewMode) {
    state.viewMode = viewMode === "list" ? "list" : "card";
    localStorage.setItem("todoListCart.productView", state.viewMode);
    renderViewMode();
  }

  function applyFormDefaults() {
    if (elements.departmentInput) {
      elements.departmentInput.value = state.data.settings.defaultDepartment;
    }

    setPriorityValue(state.data.settings.defaultPriority);
    setProductTypeValue(state.data.settings.defaultProductType);

    if (elements.moqInput) {
      elements.moqInput.value = state.data.settings.defaultMoq;
    }

    if (elements.priceInput) {
      elements.priceInput.value = state.data.settings.defaultPrice;
    }

    if (elements.unitPriceInput) {
      elements.unitPriceInput.value = state.data.settings.defaultPrice;
      updateTotalPriceFromUnit();
    }
  }

  function getUnitPriceFromTotal(totalPrice, availableUnits) {
    const total = Number(totalPrice || 0);
    const quantity = Math.max(1, Number(availableUnits || 1));
    return Number.isFinite(total) && Number.isFinite(quantity) ? (total / quantity).toFixed(2) : "0.00";
  }

  function updateTotalPriceFromUnit() {
    if (!elements.unitPriceInput || !elements.priceInput || !elements.availableUnitsInput) {
      return;
    }

    const unitPrice = Number(elements.unitPriceInput.value || 0);
    const availableUnits = Math.max(1, Number(elements.availableUnitsInput.value || 1));
    elements.priceInput.value = (Number.isFinite(unitPrice) ? unitPrice * availableUnits : 0).toFixed(2);
  }

  function applyEditProduct() {
    if (!elements.productForm || !state.editProductId) {
      return false;
    }

    const product = state.data.products.find((entry) => entry.id === state.editProductId);

    if (!product) {
      state.editProductId = null;
      return false;
    }

    elements.titleInput.value = product.title;
    elements.descriptionInput.value = product.description;
    elements.locationInput.value = product.location;
    elements.departmentInput.value = product.department;
    setProductTypeValue(product.productType);
    setPriorityValue(product.priority);
    elements.moqInput.value = product.moq;
    elements.priceInput.value = product.price;
    if (elements.unitPriceInput) {
      elements.unitPriceInput.value = product.unitPrice || getUnitPriceFromTotal(product.price, product.availableUnits);
    }
    elements.availableUnitsInput.value = product.availableUnits;
    elements.inStockInput.checked = product.inStock;
    state.formImages = product.images.map((image) => ({ ...image }));
    state.referenceUrls = [...product.referenceUrls];
    state.relationSelections = {
      related: [...product.relatedProductIds],
      bundle: [...product.bundleProductIds],
      addons: [...(product.addonProductIds || [])]
    };
    state.selectedVendorIds = new Set(state.data.vendors
      .filter((vendor) => vendor.productIds.includes(product.id))
      .map((vendor) => vendor.id));
    state.vendorQuery = "";
    if (elements.vendorSearchInput) {
      elements.vendorSearchInput.value = "";
    }

    if (elements.createTitle) {
      elements.createTitle.textContent = `Edit ${product.title}`;
    }

    if (elements.formHeading) {
      elements.formHeading.textContent = "Edit product details";
    }

    if (elements.createSubmit) {
      elements.createSubmit.textContent = "Save Changes";
    }

    renderImagePreview();
    renderReferenceUrls();
    renderVendorOptions();
    return true;
  }

  async function persistAndRender() {
    state.data = await Store.saveData(state.data);
    render();
  }

  function getSelectedImages() {
    const imageUrl = elements.imageUrlInput?.value.trim() || "";

    return [
      ...(imageUrl ? [{ src: imageUrl, name: "" }] : []),
      ...state.formImages
    ];
  }

  async function readImageFile(file) {
    if (!file.type.startsWith("image/")) {
      return { image: "", imageName: "" };
    }

    if (file.size > MAX_IMAGE_BYTES) {
      alert("Choose an image up to 5 MB, or use an image URL.");
      return { image: "", imageName: "" };
    }

    return {
      image: await Store.fileToDataUrl(file),
      imageName: file.name || "clipboard-image"
    };
  }

  async function readImageFiles(files) {
    const imageFiles = [...files]
      .filter((file) => file?.type.startsWith("image/"));
    const images = [];

    for (const file of imageFiles) {
      const { image, imageName } = await readImageFile(file);

      if (image) {
        images.push({ src: image, name: imageName });
      }
    }

    return images;
  }

  async function addProduct(event) {
    event.preventDefault();

    if (state.isSavingProduct) {
      return;
    }

    const title = elements.titleInput.value.trim();

    if (!title) {
      return;
    }

    setProductSaving(true, "Preparing product...");

    try {
      const images = getSelectedImages();
      syncVendorSelection();
      setProductSaving(true, images.length ? "Preparing images..." : "Saving product...");

      const availableUnits = Math.max(1, Math.floor(Number(elements.availableUnitsInput.value) || 1));
      const existingCompletedUnits = state.editProductId
        ? Number(state.data.products.find((product) => product.id === state.editProductId)?.completedUnits || 0)
        : 0;
      const completedUnits = elements.inStockInput.checked && existingCompletedUnits >= availableUnits
        ? Math.max(0, availableUnits - 1)
        : existingCompletedUnits;
      const productValues = {
        title,
        department: elements.departmentInput.value,
        productType: getProductTypeValue(),
        location: elements.locationInput?.value.trim() || "Unspecified",
        priority: getPriorityValue(),
        moq: elements.moqInput.value,
        unitPrice: elements.unitPriceInput?.value || getUnitPriceFromTotal(elements.priceInput.value, elements.availableUnitsInput.value),
        price: elements.priceInput.value,
        availableUnits: String(availableUnits),
        completedUnits,
        inStock: elements.inStockInput.checked,
        description: elements.descriptionInput?.value.trim() || "",
        referenceUrls: state.referenceUrls,
        relatedProductIds: state.relationSelections?.related || [],
        bundleProductIds: state.relationSelections?.bundle || [],
        addonProductIds: state.relationSelections?.addons || [],
        images: await Store.prepareCardImages(images)
      };

      setProductSaving(true, "Saving product...");

      if (state.editProductId) {
        const existingProduct = state.data.products.find((product) => product.id === state.editProductId);

        if (existingProduct) {
          state.data.products = state.data.products.map((product) => (
            product.id === state.editProductId
              ? Store.normalizeProduct({
                ...existingProduct,
                ...productValues,
                // The gallery is authoritative on edit; do not restore a removed legacy primary image.
                image: "",
                imageName: ""
              })
              : product
          ));
          state.data.products = Store.setRelatedProductLinks(
            state.data.products,
            state.editProductId,
            productValues.relatedProductIds
          );
          updateProductVendors(state.editProductId, state.selectedVendorIds);
          await Store.saveData(state.data);
          setProductSaving(true, "Opening saved product...");
          window.location.href = Store.getExtensionUrl(`product.html?id=${encodeURIComponent(state.editProductId)}`);
          return;
        }
      }

      const createdProduct = Store.createProduct(productValues);
      state.data.products.unshift(createdProduct);
      state.data.products = Store.setRelatedProductLinks(
        state.data.products,
        createdProduct.id,
        createdProduct.relatedProductIds
      );
      updateProductVendors(createdProduct.id, state.selectedVendorIds);
      await Store.saveData(state.data);
      setProductSaving(true, "Opening saved product...");
      window.location.href = Store.getExtensionUrl(`product.html?id=${encodeURIComponent(createdProduct.id)}`);
    } catch (error) {
      console.error(error);
      alert("The product could not be saved. Please try again.");
      setProductSaving(false);
    }
  }

  async function addCategoryFromInput() {
    const name = elements.categoryNameInput?.value.trim();

    if (!name) {
      return;
    }

    const existing = state.data.categories.find((category) => (
      category.name.toLowerCase() === name.toLowerCase()
    ));

    const category = existing || Store.createCategory(name, state.data.categories);

    if (!existing) {
      state.data.categories.push(category);
    }

    elements.categoryNameInput.value = "";
    renderCategoryControls();
    elements.departmentInput.value = category.id;
    await persistAndRender();
  }

  async function addToCart(productId) {
    const activeCart = getActiveCart();
    const product = getProduct(productId);

    if (activeCart.items.some((item) => item.productId === productId) || !product?.inStock) {
      return;
    }

    const existingProductIds = new Set(activeCart.items.map((item) => item.productId));
    const addonItems = (product.addonProductIds || [])
      .map((addonId) => getProduct(addonId))
      .filter((addon) => addon?.inStock && !existingProductIds.has(addon.id))
      .map((addon) => ({
        id: Store.createId("item"),
        productId: addon.id,
        done: false,
        addedAt: Date.now()
      }));

    setActiveCart({
      ...activeCart,
      items: [{
        id: Store.createId("item"),
        productId,
        done: false,
        addedAt: Date.now()
      }, ...addonItems, ...activeCart.items]
    });

    await persistAndRender();
  }

  async function buyNow(productId) {
    const product = getProduct(productId);

    if (!product?.inStock) {
      return;
    }

    Store.openExtensionPage(`buy-now.html?id=${encodeURIComponent(productId)}`);
  }

  async function toggleWishlist(productId) {
    if (state.wishlistPending.has(productId)) return;
    const product = getProduct(productId);
    if (!product) return;
    const adding = !state.data.wishlist.includes(productId);
    const action = adding ? "adding" : "removing";
    state.wishlistPending.set(productId, action);
    const card = [...(elements.productList?.querySelectorAll(".product-card") || [])]
      .find((entry) => entry.dataset.id === productId);
    showWishlistSaving(card, action, product.title);

    const saveTask = state.wishlistSaveQueue.then(async () => {
      const latest = await Store.loadData();
      latest.wishlist = adding
        ? [...new Set([...latest.wishlist, productId])]
        : latest.wishlist.filter((id) => id !== productId);
      state.data = await Store.saveData(latest);
    });
    state.wishlistSaveQueue = saveTask.catch(() => {});
    try {
      await Promise.all([saveTask, new Promise((resolve) => setTimeout(resolve, 550))]);
      state.data = await Store.loadData();
    } catch (error) {
      console.error("Could not update wishlist", error);
      state.data = await Store.loadData();
      window.alert("Could not update the wishlist. Please try again.");
    } finally {
      state.wishlistPending.delete(productId);
      render();
    }
  }

  async function removeFromCart(productId) {
    const product = getProduct(productId);
    const title = product?.title || "this item";

    if (!window.confirm(`Remove ${title} from the cart?`)) {
      return;
    }

    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => item.productId !== productId)
    });
    await persistAndRender();
  }

  function setMoveWishlistProgress(button, isMoving) {
    if (!button) return;
    button.disabled = isMoving;
    button.classList.toggle("is-moving", isMoving);
    button.setAttribute("aria-busy", String(isMoving));
    button.textContent = isMoving ? "Moving..." : "Move to wishlist";
  }

  async function moveCartItemToWishlist(productId, button) {
    setMoveWishlistProgress(button, true);
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => item.productId !== productId)
    });
    state.data.wishlist = [...new Set([...(state.data.wishlist || []), productId])];
    try {
      await persistAndRender();
    } catch (error) {
      setMoveWishlistProgress(button, false);
      throw error;
    }
  }

  async function toggleDone(productId, done) {
    const activeCart = getActiveCart();
    const item = activeCart.items.find((entry) => entry.productId === productId);

    if (!item || item.done === done) {
      return;
    }

    setActiveCart({
      ...activeCart,
      items: activeCart.items.map((item) => (
        item.productId === productId ? { ...item, done } : item
      ))
    });
    state.data.products = state.data.products.map((product) => {
      if (product.id !== productId) {
        return product;
      }

      const completedUnits = Math.max(0, Number(product.completedUnits || 0) + (done ? 1 : -1));
      return {
        ...product,
        completedUnits,
        inStock: done && completedUnits >= Number(product.availableUnits) ? false : product.inStock
      };
    });
    await persistAndRender();
  }

  async function checkoutAll() {
    const activeCart = getActiveCart();
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    const order = Store.createOrder(activeCart, productsById);

    if (!order.items.length) {
      return;
    }

    state.data.orders.unshift(order);

    const newlyCompleted = activeCart.items.filter((item) => !item.done);
    state.data.products = state.data.products.map((product) => {
      const completedNow = newlyCompleted.filter((item) => item.productId === product.id).length;

      if (!completedNow) {
        return product;
      }

      const completedUnits = Number(product.completedUnits || 0) + completedNow;
      return {
        ...product,
        completedUnits,
        inStock: completedUnits >= Number(product.availableUnits) ? false : product.inStock
      };
    });

    setActiveCart({
      ...activeCart,
      items: state.data.settings.checkoutBehavior === "clear"
        ? []
        : activeCart.items.map((item) => ({ ...item, done: true }))
    });
    await persistAndRender();
  }

  async function clearDone() {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => !item.done)
    });
    await persistAndRender();
  }

  async function createCart(event) {
    event.preventDefault();
    const name = elements.cartNameInput.value.trim();

    if (!name) {
      return;
    }

    const cart = Store.createCart(name);
    state.data.carts.push(cart);
    state.data.activeCartId = cart.id;
    elements.cartNameInput.value = "";
    await persistAndRender();
  }

  async function deleteActiveCart() {
    if (state.data.carts.length <= 1) {
      return;
    }

    state.data.carts = state.data.carts.filter((cart) => cart.id !== state.data.activeCartId);
    state.data.activeCartId = state.data.carts[0].id;
    await persistAndRender();
  }

  function openFullTab() {
    Store.openExtensionPage("newtab.html");
  }

  function openProductsPage() {
    Store.openExtensionPage("products.html");
  }

  function openOrdersPage() {
    Store.openExtensionPage("order-history.html");
  }

  function openAccountPage() {
    Store.openExtensionPage("account.html");
  }

  function openProductDetail(productId, tabName = "") {
    const tabQuery = tabName ? `&tab=${encodeURIComponent(tabName)}` : "";
    Store.openExtensionPage(`product.html?id=${encodeURIComponent(productId)}${tabQuery}`);
  }

  function setDepartment(department) {
    state.department = department;
    resetProductPage();
    renderCategoryControls();
    renderProducts();
  }

  function clearImageSelection() {
    state.formImages = [];

    if (elements.imageFileInput) {
      elements.imageFileInput.value = "";
    }

    if (elements.imageUrlInput) {
      elements.imageUrlInput.value = "";
    }

    renderImagePreview();
  }

  function renderReferenceUrls() {
    if (!elements.referenceUrlList) {
      return;
    }

    elements.referenceUrlList.replaceChildren();
    elements.referenceUrlList.hidden = state.referenceUrls.length === 0;
    state.referenceUrls.forEach((url, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const remove = document.createElement("button");

      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = url;
      remove.type = "button";
      remove.className = "remove-reference-url";
      remove.dataset.referenceIndex = String(index);
      remove.setAttribute("aria-label", `Remove reference link ${index + 1}`);
      remove.textContent = "×";
      item.append(link, remove);
      elements.referenceUrlList.append(item);
    });
  }

  function addReferenceUrl() {
    const rawUrl = elements.referenceUrlInput?.value.trim() || "";
    const url = Store.normalizeProduct({ referenceUrls: [rawUrl] }).referenceUrls[0];

    if (!url || state.referenceUrls.includes(url)) {
      return;
    }

    state.referenceUrls.push(url);
    elements.referenceUrlInput.value = "";
    renderReferenceUrls();
  }

  function removeImage(index) {
    const hasUrlImage = Boolean(elements.imageUrlInput?.value.trim());

    if (hasUrlImage && index === 0) {
      elements.imageUrlInput.value = "";
    } else {
      const formImageIndex = index - (hasUrlImage ? 1 : 0);
      state.formImages.splice(formImageIndex, 1);
    }

    renderImagePreview();
  }

  function moveImage(index, direction) {
    const imageUrl = elements.imageUrlInput?.value.trim() || "";
    const images = [
      ...(imageUrl ? [{ src: imageUrl, name: "Image URL" }] : []),
      ...state.formImages
    ];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    [images[index], images[targetIndex]] = [images[targetIndex], images[index]];

    if (elements.imageUrlInput) {
      elements.imageUrlInput.value = "";
    }
    state.formImages = images.map((entry) => ({ ...entry }));
    renderImagePreview();
  }

  async function applyDroppedOrPastedImages(files) {
    if (!files.length) {
      return;
    }

    const images = await readImageFiles(files);

    if (!images.length) {
      return;
    }

    state.formImages = [...state.formImages, ...images];

    if (elements.imageFileInput) {
      elements.imageFileInput.value = "";
    }

    renderImagePreview();
  }

  function getImageFilesFromTransfer(dataTransfer) {
    const files = [...(dataTransfer?.files || [])]
      .filter((entry) => entry.type.startsWith("image/"));

    if (files.length) {
      return files;
    }

    return [...(dataTransfer?.items || [])]
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((entry) => entry?.type.startsWith("image/"));
  }

  function bindImageDropzone() {
    if (!elements.imageDropzone) {
      return;
    }

    elements.imageDropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      elements.imageDropzone.classList.add("dragging");
    });

    elements.imageDropzone.addEventListener("dragleave", () => {
      elements.imageDropzone.classList.remove("dragging");
    });

    elements.imageDropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      elements.imageDropzone.classList.remove("dragging");
      applyDroppedOrPastedImages(getImageFilesFromTransfer(event.dataTransfer));
    });

    function handleImagePaste(event) {
      const files = getImageFilesFromTransfer(event.clipboardData);

      if (files.length) {
        event.preventDefault();
        event.stopPropagation();
        applyDroppedOrPastedImages(files);
      }
    }

    elements.imageDropzone.addEventListener("paste", handleImagePaste);
    elements.productForm?.addEventListener("paste", handleImagePaste);
  }

  function bindEvents() {
    elements.productForm?.addEventListener("submit", addProduct);
    elements.cartForm?.addEventListener("submit", createCart);
    elements.deleteCart?.addEventListener("click", deleteActiveCart);
    elements.addCategory?.addEventListener("click", addCategoryFromInput);
    elements.categoryNameInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategoryFromInput();
      }
    });

    elements.cartSelect?.addEventListener("change", () => {
      state.data.activeCartId = elements.cartSelect.value;
      render();
      Store.saveData(state.data);
    });

    elements.imageUrlInput?.addEventListener("input", () => {
      renderImagePreview();
    });

    elements.imageFileInput?.addEventListener("change", async () => {
      const files = [...(elements.imageFileInput.files || [])];

      if (!files.length) {
        state.formImages = [];
        renderImagePreview();
        return;
      }

      const images = await readImageFiles(files);

      if (!images.length) {
        clearImageSelection();
        return;
      }

      state.formImages = [...state.formImages, ...images];

      renderImagePreview();
    });

    elements.clearImage?.addEventListener("click", clearImageSelection);
    elements.addReferenceUrl?.addEventListener("click", addReferenceUrl);
    elements.referenceUrlInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addReferenceUrl();
      }
    });
    elements.referenceUrlList?.addEventListener("click", (event) => {
      const button = event.target.closest(".remove-reference-url");
      if (!button) {
        return;
      }

      state.referenceUrls.splice(Number(button.dataset.referenceIndex), 1);
      renderReferenceUrls();
    });
    elements.relationSearchInput?.addEventListener("input", () => {
      state.relationQuery = elements.relationSearchInput.value.trim();
      renderProductRelationOptions();
    });
    elements.relatedProductsInput?.addEventListener("change", () => {
      syncRelationSelection(elements.relatedProductsInput, "related");
    });
    elements.bundleProductsInput?.addEventListener("change", () => {
      syncRelationSelection(elements.bundleProductsInput, "bundle");
    });
    elements.addonProductsInput?.addEventListener("change", () => {
      syncRelationSelection(elements.addonProductsInput, "addons");
    });
    elements.vendorSearchInput?.addEventListener("input", () => {
      syncVendorSelection();
      state.vendorQuery = elements.vendorSearchInput.value.trim();
      renderVendorOptions();
    });
    elements.vendorsInput?.addEventListener("change", syncVendorSelection);
    elements.imagePreview?.addEventListener("click", (event) => {
      const moveButton = event.target.closest(".move-image-button");
      if (moveButton) {
        moveImage(Number(moveButton.dataset.imageIndex), Number(moveButton.dataset.imageDirection));
        return;
      }

      const button = event.target.closest(".remove-image-button");

      if (button) {
        removeImage(Number(button.dataset.imageIndex));
      }
    });
    bindImageDropzone();

    elements.searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      state.query = elements.searchInput.value.trim();
      resetProductPage();
      renderProducts();
    });

    elements.searchInput?.addEventListener("input", () => {
      state.query = elements.searchInput.value.trim();
      resetProductPage();
      renderProducts();
    });

    elements.productsPerPage?.addEventListener("change", () => {
      state.pageSize = Number(elements.productsPerPage.value);
      resetProductPage();
      localStorage.setItem("todoListCart.productsPerPage", String(state.pageSize));
      renderProducts();
    });

    elements.previousProductPage?.addEventListener("click", () => {
      state.currentPage = Math.max(1, state.currentPage - 1);
      renderProducts();
    });

    elements.nextProductPage?.addEventListener("click", () => {
      state.currentPage += 1;
      renderProducts();
    });

    elements.departments?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-department]");

      if (button) {
        setDepartment(button.dataset.department);
      }
    });

    elements.viewButtons.forEach((button) => {
      button.addEventListener("click", () => setViewMode(button.dataset.view));
    });

    elements.filterDepartment?.addEventListener("change", () => {
      setDepartment(elements.filterDepartment.value);
    });

    elements.filterPriority?.addEventListener("change", () => {
      state.priority = elements.filterPriority.value;
      resetProductPage();
      renderProducts();
    });

    elements.filterLocation?.addEventListener("change", () => {
      state.location = elements.filterLocation.value;
      resetProductPage();
      renderProducts();
    });

    elements.cartStatusFilter?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-cart-status]");
      if (!button) {
        return;
      }

      state.cartStatus = button.dataset.cartStatus;
      resetProductPage();
      renderCartStatusFilter();
      renderProducts();
    });

    elements.wishlistFilter?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-wishlist-status]");
      if (!button) return;
      state.wishlistStatus = button.dataset.wishlistStatus;
      resetProductPage();
      renderWishlistFilter();
      renderProducts();
    });

    elements.archiveFilter?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-archive-status]");
      if (!button) return;
      state.archiveStatus = button.dataset.archiveStatus;
      if (state.archiveStatus === "archived" && state.stockAvailability === "in-stock") {
        state.stockAvailability = "all";
        renderStockFilter();
      }
      resetProductPage();
      renderArchiveFilter();
      renderProducts();
    });

    elements.stockFilter?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-stock]");
      if (!button) {
        return;
      }

      state.stockAvailability = button.dataset.stock;
      resetProductPage();
      renderStockFilter();
      renderProducts();
    });

    elements.unitPriceInput?.addEventListener("input", updateTotalPriceFromUnit);
    elements.availableUnitsInput?.addEventListener("input", updateTotalPriceFromUnit);

    elements.filterPriceMin?.addEventListener("input", () => {
      state.priceMin = Number(elements.filterPriceMin.value);
      if (state.priceMax !== null && state.priceMin > state.priceMax) {
        state.priceMax = state.priceMin;
      }
      resetProductPage();
      renderRangeFilters();
      renderProducts();
    });

    elements.filterPriceMax?.addEventListener("input", () => {
      state.priceMax = Number(elements.filterPriceMax.value);
      if (state.priceMin !== null && state.priceMax < state.priceMin) {
        state.priceMin = state.priceMax;
      }
      resetProductPage();
      renderRangeFilters();
      renderProducts();
    });

    elements.filterTimeMin?.addEventListener("input", () => {
      state.timeMin = Number(elements.filterTimeMin.value);
      if (state.timeMax !== null && state.timeMin > state.timeMax) {
        state.timeMax = state.timeMin;
      }
      resetProductPage();
      renderRangeFilters();
      renderProducts();
    });

    elements.filterTimeMax?.addEventListener("input", () => {
      state.timeMax = Number(elements.filterTimeMax.value);
      if (state.timeMin !== null && state.timeMax < state.timeMin) {
        state.timeMin = state.timeMax;
      }
      resetProductPage();
      renderRangeFilters();
      renderProducts();
    });

    elements.clearFilters?.addEventListener("click", () => {
      state.department = "all";
      state.priority = "all";
      state.location = "all";
      state.cartStatus = "all";
      state.wishlistStatus = state.isPopup ? "all" : "not-in-wishlist";
      state.archiveStatus = "not-archived";
      state.stockAvailability = "in-stock";
      state.priceMin = null;
      state.priceMax = null;
      state.timeMin = null;
      state.timeMax = null;
      state.query = "";
      resetProductPage();

      if (elements.searchInput) {
        elements.searchInput.value = "";
      }

      if (elements.filterPriority) {
        elements.filterPriority.value = "all";
      }

      if (elements.filterLocation) {
        elements.filterLocation.value = "all";
      }

      renderCategoryControls();
      renderLocationOptions();
      renderRangeFilters();
      renderStockFilter();
      renderCartStatusFilter();
      renderWishlistFilter();
      renderArchiveFilter();
      renderProducts();
    });

    elements.productList?.addEventListener("click", (event) => {
      const filterButton = event.target.closest("[data-card-filter]");
      const carouselButton = event.target.closest(".carousel-button");
      const carouselDot = event.target.closest(".carousel-dot");
      const wishlistButton = event.target.closest(".wishlist-button");
      const commentButton = event.target.closest(".comment-count-button");
      const addButton = event.target.closest(".add-cart-button");
      const buyNowButton = event.target.closest(".buy-now-button");

      if (filterButton) {
        if (filterButton.dataset.cardFilter === "category") {
          setDepartment(filterButton.dataset.department);
        } else {
          state.location = filterButton.dataset.location || "all";
          if (elements.filterLocation) {
            elements.filterLocation.value = state.location;
          }
          resetProductPage();
          renderProducts();
        }
        return;
      }

      if (carouselButton) {
        moveCarousel(carouselButton);
        return;
      }

      if (carouselDot) {
        setCarouselImage(carouselDot.closest(".product-image"), Number(carouselDot.dataset.carouselIndex));
        return;
      }

      if (wishlistButton) {
        toggleWishlist(wishlistButton.closest(".product-card").dataset.id);
        return;
      }

      if (commentButton) {
        openProductDetail(commentButton.closest(".product-card").dataset.id, "comments");
        return;
      }

      if (addButton) {
        event.preventDefault();
        event.stopPropagation();
        addToCart(addButton.closest(".product-card").dataset.id);
        return;
      }

      if (buyNowButton) {
        event.preventDefault();
        event.stopPropagation();
        buyNow(buyNowButton.closest(".product-card").dataset.id);
        return;
      }

      const card = event.target.closest(".product-card");

      if (card) {
        openProductDetail(card.dataset.id);
      }
    });

    elements.productList?.addEventListener("keydown", (event) => {
      const card = event.target.closest(".product-card");

      if (card && event.target === card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openProductDetail(card.dataset.id);
      }
    });

    elements.cartList?.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[type='checkbox']");

      if (checkbox) {
        toggleDone(checkbox.closest(".cart-item").dataset.productId, checkbox.checked);
      }
    });

    elements.cartList?.addEventListener("click", (event) => {
      const moveWishlist = event.target.closest(".cart-move-wishlist");

      if (moveWishlist) {
        moveCartItemToWishlist(moveWishlist.closest(".cart-item").dataset.productId, moveWishlist);
        return;
      }

      const button = event.target.closest(".remove-cart-button");

      if (button) {
        removeFromCart(button.closest(".cart-item").dataset.productId);
        return;
      }

      if (event.target.closest(".cart-check")) {
        return;
      }

      const item = event.target.closest(".cart-item");

      if (item) {
        openProductDetail(item.dataset.productId);
      }
    });

    elements.cartList?.addEventListener("keydown", (event) => {
      const item = event.target.closest(".cart-item");

      if (item && event.target === item && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openProductDetail(item.dataset.productId);
      }
    });

    elements.clearDone?.addEventListener("click", clearDone);
    elements.checkoutAll?.addEventListener("click", checkoutAll);
    elements.openFullTab?.addEventListener("click", openFullTab);
    elements.openProductsPage?.addEventListener("click", openProductsPage);
    elements.openOrdersPage?.addEventListener("click", openOrdersPage);
    elements.openAccountPage?.addEventListener("click", openAccountPage);
    elements.cartJump?.addEventListener("click", () => {
      if (state.isPopup) {
        Store.openExtensionPage("cart.html");
      } else {
        window.location.href = Store.getExtensionUrl("cart.html");
      }
    });
    elements.demoDataToggle?.addEventListener("change", toggleDemoData);
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    const demoState = await Store.loadDemoState();
    if (demoState.enabled && demoState.version < DEMO_DATA_VERSION) {
      state.data = await Store.saveData(createDemoData());
      await Store.saveDemoState({ ...demoState, version: DEMO_DATA_VERSION });
    }
    renderDemoToggle(demoState.enabled);
    const preparedProducts = await Promise.all(state.data.products.map(async (product) => {
      const images = await Store.prepareCardImages(product.images || []);
      return {
        ...product,
        images,
        image: images[0]?.src || "",
        imageName: images[0]?.name || ""
      };
    }));
    if (preparedProducts.some((product, index) => product.images.some((image, imageIndex) => image.cardSrc !== state.data.products[index].images[imageIndex]?.cardSrc))) {
      state.data.products = preparedProducts;
      state.data = await Store.saveData(state.data);
    }
    Store.watchDataChanges(async () => {
      state.data = await Store.loadData();
      render();
    });
    const savedPageSize = Number(localStorage.getItem("todoListCart.productsPerPage"));
    state.pageSize = [6, 12, 24, 48].includes(savedPageSize)
      ? savedPageSize
      : state.data.settings.productsPerPage;
    if (!state.isPopup && !localStorage.getItem("todoListCart.productView")) {
      state.viewMode = state.data.settings.defaultProductView;
    }
    if (elements.productForm) {
      state.editProductId = new URLSearchParams(window.location.search).get("id");
    }
    render();

    if (!applyEditProduct()) {
      applyFormDefaults();
    }

    const requestedDemoMode = new URLSearchParams(window.location.search).get("demo");
    const shouldEnableDemo = requestedDemoMode === "on";
    const shouldDisableDemo = requestedDemoMode === "off";
    if (elements.demoDataToggle && ((shouldEnableDemo && !demoState.enabled) || (shouldDisableDemo && demoState.enabled))) {
      elements.demoDataToggle.checked = shouldEnableDemo;
      await toggleDemoData();
    }
  }

  init();
})();
