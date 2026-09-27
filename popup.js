(function () {
  const Store = globalThis.ToDoCartStore;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const state = {
    data: Store.normalizeData({}),
    department: new URLSearchParams(window.location.search).get("department") || "all",
    priority: "all",
    location: "all",
    cartStatus: "all",
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
    pageSize: 12
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
    cartPanel: document.querySelector("#cart-panel")
  };

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

      return matchesDepartment && matchesPriority && matchesLocation && matchesCartStatus
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
      const image = document.createElement("img");

      previewItem.className = "image-preview-item";
      image.src = entry.src;
      image.alt = entry.name || `Selected product image ${index + 1}`;
      removeButton.type = "button";
      removeButton.className = "remove-image-button";
      removeButton.dataset.imageIndex = String(index);
      removeButton.setAttribute("aria-label", `Remove image ${index + 1}`);
      removeButton.title = `Remove image ${index + 1}`;
      removeButton.textContent = "×";
      previewItem.append(image, removeButton);
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
      bundle: current?.bundleProductIds || []
    };
    state.relationSelections = {
      related: [...selected.related],
      bundle: [...selected.bundle]
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
      elements.productCount.textContent = pluralize(state.data.products.length, "product", "products");
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
      const stock = node.querySelector(".cart-stock");
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
      meta.textContent = `${getCategoryName(product)} | ${Store.getPriorityLabel(product.priority)} | ${Store.formatMoq(product.moq)} | Total ${Store.formatMoney(product.price, state.data.settings)}`;
      const unitsInStock = Store.getUnitsInStock(product);
      stock.textContent = `${unitsInStock} ${unitsInStock === 1 ? "unit" : "units"} in stock`;
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
      bundle: [...product.bundleProductIds]
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
    const title = elements.titleInput.value.trim();

    if (!title) {
      return;
    }

    const images = getSelectedImages();
    syncVendorSelection();

    const productValues = {
      title,
      department: elements.departmentInput.value,
      productType: getProductTypeValue(),
      location: elements.locationInput?.value.trim() || "Unspecified",
      priority: getPriorityValue(),
      moq: elements.moqInput.value,
      unitPrice: elements.unitPriceInput?.value || getUnitPriceFromTotal(elements.priceInput.value, elements.availableUnitsInput.value),
      price: elements.priceInput.value,
      availableUnits: elements.availableUnitsInput.value,
      completedUnits: state.editProductId ? state.data.products.find((product) => product.id === state.editProductId)?.completedUnits : 0,
      inStock: elements.inStockInput.checked,
      description: elements.descriptionInput?.value.trim() || "",
      referenceUrls: state.referenceUrls,
      relatedProductIds: state.relationSelections?.related || [],
      bundleProductIds: state.relationSelections?.bundle || [],
      images: await Store.prepareCardImages(images)
    };

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
    window.location.href = Store.getExtensionUrl(`product.html?id=${encodeURIComponent(createdProduct.id)}`);
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

    if (activeCart.items.some((item) => item.productId === productId) || !getProduct(productId)?.inStock) {
      return;
    }

    setActiveCart({
      ...activeCart,
      items: [{
        id: Store.createId("item"),
        productId,
        done: false,
        addedAt: Date.now()
      }, ...activeCart.items]
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
    state.data.wishlist = state.data.wishlist.includes(productId)
      ? state.data.wishlist.filter((id) => id !== productId)
      : [...state.data.wishlist, productId];
    await persistAndRender();
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

    if (!url || state.referenceUrls.includes(url) || state.referenceUrls.length >= 8) {
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
    elements.vendorSearchInput?.addEventListener("input", () => {
      syncVendorSelection();
      state.vendorQuery = elements.vendorSearchInput.value.trim();
      renderVendorOptions();
    });
    elements.vendorsInput?.addEventListener("change", syncVendorSelection);
    elements.imagePreview?.addEventListener("click", (event) => {
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
        addToCart(addButton.closest(".product-card").dataset.id);
        return;
      }

      if (buyNowButton) {
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
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
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
    chrome.storage?.onChanged?.addListener(async (_changes, areaName) => {
      if (areaName !== "local") {
        return;
      }
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
  }

  init();
})();
