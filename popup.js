(function () {
  const Store = globalThis.ToDoCartStore;
  const MAX_IMAGE_BYTES = 1024 * 1024;
  const state = {
    data: Store.normalizeData({}),
    department: "all",
    priority: "all",
    location: "all",
    cartStatus: "all",
    priceMin: null,
    priceMax: null,
    timeMin: null,
    timeMax: null,
    query: "",
    viewMode: localStorage.getItem("todoListCart.productView") === "list" ? "list" : "card",
    editProductId: null,
    formImages: []
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    productForm: document.querySelector("#product-form"),
    titleInput: document.querySelector("#product-title"),
    descriptionInput: document.querySelector("#product-description"),
    locationInput: document.querySelector("#product-location"),
    departmentInput: document.querySelector("#product-department"),
    priorityInputs: document.querySelectorAll("input[name='priority']"),
    moqInput: document.querySelector("#product-moq"),
    priceInput: document.querySelector("#product-price"),
    inStockInput: document.querySelector("#product-in-stock"),
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
    filterCartStatus: document.querySelector("#filter-cart-status"),
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

  function setPriorityValue(priority) {
    elements.priorityInputs.forEach((input) => {
      input.checked = input.value === priority;
    });
  }

  function getCategoryName(product) {
    return Store.getCategoryLabel(state.data, product.department);
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

      return matchesDepartment && matchesPriority && matchesLocation && matchesCartStatus && matchesPrice && matchesTime && matchesQuery;
    });
  }

  function getTimeEquivalentSeconds(price) {
    const rate = Number(state.data.settings.timeRate) / Number(state.data.settings.timeSeconds || 1);
    return rate > 0 ? Number(price) / rate : 0;
  }

  function formatDuration(seconds) {
    const rounded = Math.max(0, Math.round(seconds));
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const remainder = rounded % 60;
    return [
      ...(hours ? [`${hours}h`] : []),
      ...(minutes ? [`${minutes}m`] : []),
      `${remainder}s`
    ].join(" ");
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

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function renderProductImage(container, product, isWishlisted) {
    container.replaceChildren();
    const images = product.images || [];

    if (images.length && state.data.settings.showImages) {
      if (images.length > 1) {
        const track = document.createElement("div");
        const previous = document.createElement("button");
        const next = document.createElement("button");
        const dots = document.createElement("div");

        track.className = "product-carousel-track";
        images.forEach((entry, index) => {
          const image = document.createElement("img");
          image.src = entry.src;
          image.alt = `${product.title} product image ${index + 1} of ${images.length}`;
          track.append(image);
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
        image.src = images[0].src;
        image.alt = `${product.title} product image`;
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
    wishlistButton.textContent = isWishlisted ? "♥" : "♡";
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
    elements.productList.replaceChildren();

    visibleProducts.forEach((product) => {
      const node = elements.productTemplate.content.firstElementChild.cloneNode(true);
      const imageBox = node.querySelector(".product-image");
      const title = node.querySelector(".product-title");
      const description = node.querySelector(".product-description");
      const stars = node.querySelector(".rating-stars");
      const ratingRow = node.querySelector(".rating-row");
      const priority = node.querySelector(".priority-label");
      const department = node.querySelector(".department-label");
      const location = node.querySelector(".location-label");
      const moq = node.querySelector(".moq-label");
      const price = node.querySelector(".price-label");
      const stockStatus = node.querySelector(".stock-status");
      const addButton = node.querySelector(".add-cart-button");

      node.dataset.id = product.id;
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
      priority.textContent = Store.getPriorityLabel(product.priority);
      ratingRow.dataset.priority = priority.textContent;
      ratingRow.setAttribute("aria-label", `Priority: ${priority.textContent}`);
      ratingRow.tabIndex = 0;
      Store.renderCategory(department, state.data, product.department);
      location.textContent = product.location;
      moq.textContent = Store.formatMoq(product.moq);
      price.textContent = Store.formatMoney(product.price, state.data.settings);
      stockStatus.hidden = product.inStock;

      if (!product.inStock) {
        addButton.textContent = "Out of stock";
        addButton.disabled = true;
        addButton.classList.add("out-of-stock");
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
      const title = node.querySelector(".cart-copy strong");
      const meta = node.querySelector(".cart-copy span");
      const removeButton = node.querySelector(".remove-cart-button");

      node.dataset.productId = product.id;
      node.classList.toggle("done", item.done);
      checkbox.checked = item.done;
      checkbox.setAttribute("aria-label", `Mark ${product.title} as ${item.done ? "open" : "checked out"}`);
      title.textContent = product.title;
      meta.textContent = `${getCategoryName(product)} | ${Store.getPriorityLabel(product.priority)} | ${Store.formatMoq(product.moq)} | ${Store.formatMoney(product.price, state.data.settings)}`;
      removeButton.setAttribute("aria-label", `Remove ${product.title} from cart`);

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

    document.body.classList.toggle("compact-mode", state.data.settings.compactMode);
  }

  function render() {
    renderSettings();
    renderCategoryControls();
    renderLocationOptions();
    renderCartSelector();
    renderRangeFilters();
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

    if (elements.moqInput) {
      elements.moqInput.value = state.data.settings.defaultMoq;
    }

    if (elements.priceInput) {
      elements.priceInput.value = state.data.settings.defaultPrice;
    }
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
    setPriorityValue(product.priority);
    elements.moqInput.value = product.moq;
    elements.priceInput.value = product.price;
    elements.inStockInput.checked = product.inStock;
    state.formImages = product.images.map((image) => ({ ...image }));

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
      alert("Choose an image under 1 MB, or use an image URL.");
      return { image: "", imageName: "" };
    }

    return {
      image: await Store.fileToDataUrl(file),
      imageName: file.name || "clipboard-image"
    };
  }

  async function readImageFiles(files) {
    const imageFiles = [...files]
      .filter((file) => file?.type.startsWith("image/"))
      .slice(0, 8);
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

    const productValues = {
      title,
      department: elements.departmentInput.value,
      location: elements.locationInput?.value.trim() || "Unspecified",
      priority: getPriorityValue(),
      moq: elements.moqInput.value,
      price: elements.priceInput.value,
      inStock: elements.inStockInput.checked,
      description: elements.descriptionInput?.value.trim() || "",
      images
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
        await Store.saveData(state.data);
        window.location.href = Store.getExtensionUrl(`product.html?id=${encodeURIComponent(state.editProductId)}`);
        return;
      }
    }

    const createdProduct = Store.createProduct(productValues);
    state.data.products.unshift(createdProduct);
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

  async function toggleWishlist(productId) {
    state.data.wishlist = state.data.wishlist.includes(productId)
      ? state.data.wishlist.filter((id) => id !== productId)
      : [...state.data.wishlist, productId];
    await persistAndRender();
  }

  async function removeFromCart(productId) {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => item.productId !== productId)
    });
    await persistAndRender();
  }

  async function toggleDone(productId, done) {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.map((item) => (
        item.productId === productId ? { ...item, done } : item
      ))
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

  function openProductDetail(productId) {
    Store.openExtensionPage(`product.html?id=${encodeURIComponent(productId)}`);
  }

  function setDepartment(department) {
    state.department = department;
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

    state.formImages = [...state.formImages, ...images].slice(0, 8);

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

      state.formImages = images;

      renderImagePreview();
    });

    elements.clearImage?.addEventListener("click", clearImageSelection);
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
      renderProducts();
    });

    elements.searchInput?.addEventListener("input", () => {
      state.query = elements.searchInput.value.trim();
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
      renderProducts();
    });

    elements.filterLocation?.addEventListener("change", () => {
      state.location = elements.filterLocation.value;
      renderProducts();
    });

    elements.filterCartStatus?.addEventListener("change", () => {
      state.cartStatus = elements.filterCartStatus.value;
      renderProducts();
    });

    elements.filterPriceMin?.addEventListener("input", () => {
      state.priceMin = Number(elements.filterPriceMin.value);
      if (state.priceMax !== null && state.priceMin > state.priceMax) {
        state.priceMax = state.priceMin;
      }
      renderRangeFilters();
      renderProducts();
    });

    elements.filterPriceMax?.addEventListener("input", () => {
      state.priceMax = Number(elements.filterPriceMax.value);
      if (state.priceMin !== null && state.priceMax < state.priceMin) {
        state.priceMin = state.priceMax;
      }
      renderRangeFilters();
      renderProducts();
    });

    elements.filterTimeMin?.addEventListener("input", () => {
      state.timeMin = Number(elements.filterTimeMin.value);
      if (state.timeMax !== null && state.timeMin > state.timeMax) {
        state.timeMax = state.timeMin;
      }
      renderRangeFilters();
      renderProducts();
    });

    elements.filterTimeMax?.addEventListener("input", () => {
      state.timeMax = Number(elements.filterTimeMax.value);
      if (state.timeMin !== null && state.timeMax < state.timeMin) {
        state.timeMin = state.timeMax;
      }
      renderRangeFilters();
      renderProducts();
    });

    elements.clearFilters?.addEventListener("click", () => {
      state.department = "all";
      state.priority = "all";
      state.location = "all";
      state.cartStatus = "all";
      state.priceMin = null;
      state.priceMax = null;
      state.timeMin = null;
      state.timeMax = null;
      state.query = "";

      if (elements.searchInput) {
        elements.searchInput.value = "";
      }

      if (elements.filterPriority) {
        elements.filterPriority.value = "all";
      }

      if (elements.filterCartStatus) {
        elements.filterCartStatus.value = "all";
      }

      if (elements.filterLocation) {
        elements.filterLocation.value = "all";
      }

      renderCategoryControls();
      renderLocationOptions();
      renderRangeFilters();
      renderProducts();
    });

    elements.productList?.addEventListener("click", (event) => {
      const carouselButton = event.target.closest(".carousel-button");
      const carouselDot = event.target.closest(".carousel-dot");
      const wishlistButton = event.target.closest(".wishlist-button");
      const addButton = event.target.closest(".add-cart-button");

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

      if (addButton) {
        addToCart(addButton.closest(".product-card").dataset.id);
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
      }
    });

    elements.clearDone?.addEventListener("click", clearDone);
    elements.checkoutAll?.addEventListener("click", checkoutAll);
    elements.openFullTab?.addEventListener("click", openFullTab);
    elements.openProductsPage?.addEventListener("click", openProductsPage);
    elements.openOrdersPage?.addEventListener("click", openOrdersPage);
    elements.openAccountPage?.addEventListener("click", openAccountPage);
    elements.cartJump?.addEventListener("click", () => {
      elements.cartPanel.scrollIntoView({ block: "nearest" });
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
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
