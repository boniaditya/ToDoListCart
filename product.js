(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    productId: new URLSearchParams(window.location.search).get("id"),
    detailImageIndex: 0,
    commentImages: []
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    productDetail: document.querySelector("#product-detail"),
    missingProduct: document.querySelector("#missing-product"),
    missingProductsLink: document.querySelector("#missing-products-link"),
    detailImage: document.querySelector("#detail-image"),
    title: document.querySelector("#detail-title"),
    stars: document.querySelector("#detail-stars"),
    rating: document.querySelector(".detail-rating"),
    priority: document.querySelector("#detail-priority"),
    department: document.querySelector("#detail-department"),
    location: document.querySelector("#detail-location"),
    moq: document.querySelector("#detail-moq"),
    price: document.querySelector("#detail-price"),
    created: document.querySelector("#detail-created"),
    description: document.querySelector("#detail-description"),
    commentForm: document.querySelector("#comment-form"),
    commentTitle: document.querySelector("#comment-title"),
    commentText: document.querySelector("#comment-text"),
    commentImageInput: document.querySelector("#comment-image-file"),
    commentImagePreview: document.querySelector("#comment-image-preview"),
    commentList: document.querySelector("#comment-list"),
    commentCount: document.querySelector("#comment-count"),
    emptyComments: document.querySelector("#empty-comments"),
    cartSelect: document.querySelector("#cart-select"),
    cartCount: document.querySelector("#cart-count"),
    cartStatus: document.querySelector("#detail-cart-status"),
    stockStatus: document.querySelector("#detail-stock-status"),
    editProduct: document.querySelector("#detail-edit"),
    duplicateProduct: document.querySelector("#detail-duplicate"),
    addCart: document.querySelector("#detail-add-cart"),
    removeCart: document.querySelector("#detail-remove-cart"),
    done: document.querySelector("#detail-done"),
    deleteProduct: document.querySelector("#detail-delete"),
    openProductsPage: document.querySelector("#open-products-page"),
    openHomePage: document.querySelector("#open-home-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    openAccountPage: document.querySelector("#open-account-page")
  };

  function getProduct() {
    return state.data.products.find((product) => product.id === state.productId);
  }

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function getActiveItem() {
    return getActiveCart().items.find((item) => item.productId === state.productId);
  }

  function setActiveCart(nextCart) {
    state.data.carts = state.data.carts.map((cart) => (
      cart.id === nextCart.id ? nextCart : cart
    ));
  }

  function renderProductImage(product) {
    elements.detailImage.replaceChildren();
    elements.detailImage.classList.remove("has-carousel");
    elements.detailImage.removeAttribute("tabindex");
    elements.detailImage.removeAttribute("aria-label");
    elements.detailImage.onkeydown = null;
    const images = product.images || [];

    if (images.length && state.data.settings.showImages) {
      const track = document.createElement("div");
      track.className = "detail-carousel-track";

      images.forEach((entry, index) => {
        const image = document.createElement("img");
        image.src = entry.src;
        image.alt = `${product.title} product image ${index + 1} of ${images.length}`;
        track.append(image);
      });

      elements.detailImage.append(track);

      if (images.length > 1) {
        const previous = document.createElement("button");
        const next = document.createElement("button");
        const dots = document.createElement("div");

        elements.detailImage.classList.add("has-carousel");
        elements.detailImage.tabIndex = 0;
        elements.detailImage.setAttribute("aria-label", `${product.title} image gallery`);
        previous.type = "button";
        previous.className = "detail-carousel-button previous";
        previous.setAttribute("aria-label", "Previous image");
        previous.textContent = "‹";
        next.type = "button";
        next.className = "detail-carousel-button next";
        next.setAttribute("aria-label", "Next image");
        next.textContent = "›";
        dots.className = "detail-carousel-dots";

        images.forEach((entry, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "detail-carousel-dot";
          dot.setAttribute("aria-label", `Show image ${index + 1}`);
          dot.addEventListener("click", () => showDetailImage(index));
          dots.append(dot);
        });

        previous.addEventListener("click", () => showDetailImage(state.detailImageIndex - 1));
        next.addEventListener("click", () => showDetailImage(state.detailImageIndex + 1));
        elements.detailImage.onkeydown = (event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            showDetailImage(state.detailImageIndex + (event.key === "ArrowLeft" ? -1 : 1));
          }
        };
        elements.detailImage.append(previous, next, dots);
      }

      state.detailImageIndex = Math.min(state.detailImageIndex, images.length - 1);
      showDetailImage(state.detailImageIndex);
      return;
    }

    elements.detailImage.append(document.createElement("span"));
  }

  function showDetailImage(index) {
    const product = getProduct();
    const images = product?.images || [];
    const track = elements.detailImage.querySelector(".detail-carousel-track");

    if (!track || !images.length) {
      return;
    }

    state.detailImageIndex = (index + images.length) % images.length;
    track.style.transform = `translateX(-${state.detailImageIndex * 100}%)`;
    [...track.children].forEach((image, imageIndex) => {
      image.setAttribute("aria-hidden", String(imageIndex !== state.detailImageIndex));
    });
    elements.detailImage.querySelectorAll(".detail-carousel-dot").forEach((dot, dotIndex) => {
      const active = dotIndex === state.detailImageIndex;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function renderCartSelector() {
    elements.cartSelect.replaceChildren();

    state.data.carts.forEach((cart) => {
      const option = document.createElement("option");
      option.value = cart.id;
      option.textContent = cart.name;
      elements.cartSelect.append(option);
    });

    elements.cartSelect.value = state.data.activeCartId;
  }

  function renderComments(product) {
    const comments = [...(product.comments || [])].sort((first, second) => second.createdAt - first.createdAt);
    elements.commentList.replaceChildren();

    comments.forEach((comment) => {
      const item = document.createElement("li");
      const timestamp = document.createElement("time");
      const title = document.createElement("strong");
      const text = document.createElement("p");

      timestamp.dateTime = new Date(comment.createdAt).toISOString();
      timestamp.textContent = Store.formatDateTime(comment.createdAt);
      title.textContent = comment.title;
      text.textContent = comment.text;
      item.append(timestamp);
      if (comment.title) {
        item.append(title);
      }
      if (comment.text) {
        item.append(text);
      }
      if (comment.images.length) {
        const images = document.createElement("div");
        images.className = "comment-images";
        comment.images.forEach((entry, index) => {
          const image = document.createElement("img");
          image.src = entry.src;
          image.alt = comment.title || `Comment image ${index + 1}`;
          images.append(image);
        });
        item.append(images);
      }
      elements.commentList.append(item);
    });

    elements.commentCount.textContent = `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`;
    elements.emptyComments.hidden = comments.length > 0;
  }

  function renderMissing() {
    elements.productDetail.hidden = true;
    elements.missingProduct.hidden = false;
  }

  function render() {
    const product = getProduct();

    renderSettings();

    if (!product) {
      renderMissing();
      return;
    }

    const activeCart = getActiveCart();
    const activeItem = getActiveItem();
    const cartCount = activeCart.items.length;

    document.title = `${product.title} - ToDoList Cart`;
    elements.productDetail.hidden = false;
    elements.missingProduct.hidden = true;
    renderProductImage(product);
    renderCartSelector();

    elements.title.textContent = product.title;
    elements.stars.textContent = Store.getStars(product.priority);
    elements.priority.textContent = Store.getPriorityLabel(product.priority);
    elements.rating.dataset.priority = elements.priority.textContent;
    elements.rating.setAttribute("aria-label", `Priority: ${elements.priority.textContent}`);
    elements.rating.tabIndex = 0;
    Store.renderCategory(elements.department, state.data, product.department);
    elements.location.textContent = product.location;
    elements.moq.textContent = Store.formatMoq(product.moq);
    elements.price.textContent = Store.formatMoney(product.price, state.data.settings);
    elements.created.textContent = Store.formatDate(product.createdAt);
    elements.description.textContent = product.description || "No description added yet.";
    renderComments(product);
    elements.cartCount.textContent = cartCount;
    elements.cartStatus.textContent = activeItem
      ? `In ${activeCart.name}${activeItem.done ? " and checked out" : ""}`
      : `Not in ${activeCart.name}`;
    elements.stockStatus.hidden = product.inStock;
    elements.addCart.disabled = Boolean(activeItem) || !product.inStock;
    elements.removeCart.disabled = !activeItem;
    elements.done.disabled = !activeItem;
    elements.done.checked = Boolean(activeItem?.done);
  }

  function renderSettings() {
    elements.brandName.textContent = state.data.settings.storeName;
    document.body.classList.toggle("compact-mode", state.data.settings.compactMode);
  }

  async function persistAndRender() {
    state.data = await Store.saveData(state.data);
    render();
  }

  async function addComment(event) {
    event.preventDefault();
    const text = elements.commentText.value.trim();
    const title = elements.commentTitle.value.trim();

    if (!title && !text && !state.commentImages.length) {
      return;
    }

    state.data.products = state.data.products.map((product) => (
      product.id === state.productId
        ? {
          ...product,
          comments: [...(product.comments || []), {
            id: Store.createId("comment"),
            title,
            text,
            images: state.commentImages,
            createdAt: Date.now()
          }]
        }
        : product
    ));
    elements.commentForm.reset();
    state.commentImages = [];
    renderCommentImagePreview();
    await persistAndRender();
  }

  function renderCommentImagePreview() {
    elements.commentImagePreview.replaceChildren();
    elements.commentImagePreview.hidden = state.commentImages.length === 0;
    state.commentImages.forEach((entry, index) => {
      const image = document.createElement("img");
      image.src = entry.src;
      image.alt = entry.name || `Comment image ${index + 1}`;
      elements.commentImagePreview.append(image);
    });
  }

  async function addCommentImages(files) {
    const selected = [...files].filter((file) => file.type.startsWith("image/")).slice(0, 4);
    const images = [];

    for (const file of selected) {
      if (file.size <= 1024 * 1024) {
        images.push({ src: await Store.fileToDataUrl(file), name: file.name || "comment-image" });
      }
    }

    state.commentImages = images;
    renderCommentImagePreview();
  }

  async function addToCart() {
    const activeCart = getActiveCart();

    if (getActiveItem() || !getProduct()?.inStock) {
      return;
    }

    setActiveCart({
      ...activeCart,
      items: [{
        id: Store.createId("item"),
        productId: state.productId,
        done: false,
        addedAt: Date.now()
      }, ...activeCart.items]
    });

    await persistAndRender();
  }

  async function removeFromCart() {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.filter((item) => item.productId !== state.productId)
    });
    await persistAndRender();
  }

  async function toggleDone(done) {
    const activeCart = getActiveCart();
    setActiveCart({
      ...activeCart,
      items: activeCart.items.map((item) => (
        item.productId === state.productId ? { ...item, done } : item
      ))
    });
    await persistAndRender();
  }

  async function deleteProduct() {
    state.data.products = state.data.products.filter((product) => product.id !== state.productId);
    state.data.wishlist = state.data.wishlist.filter((productId) => productId !== state.productId);
    state.data.carts = state.data.carts.map((cart) => ({
      ...cart,
      items: cart.items.filter((item) => item.productId !== state.productId)
    }));
    await Store.saveData(state.data);
    window.location.href = Store.getExtensionUrl("products.html");
  }

  function editProduct() {
    window.location.href = Store.getExtensionUrl(`create-product.html?id=${encodeURIComponent(state.productId)}`);
  }

  async function duplicateProduct() {
    const product = getProduct();

    if (!product) {
      return;
    }

    const copy = Store.createProduct({
      title: `${product.title} (Copy)`,
      department: product.department,
      location: product.location,
      priority: product.priority,
      moq: product.moq,
      price: product.price,
      inStock: product.inStock,
      description: product.description,
      images: product.images.map((image) => ({ ...image }))
    });

    state.data.products.unshift(copy);
    await Store.saveData(state.data);
    window.location.href = Store.getExtensionUrl(`create-product.html?id=${encodeURIComponent(copy.id)}`);
  }

  function bindEvents() {
    elements.cartSelect.addEventListener("change", async () => {
      state.data.activeCartId = elements.cartSelect.value;
      await persistAndRender();
    });

    elements.addCart.addEventListener("click", addToCart);
    elements.removeCart.addEventListener("click", removeFromCart);
    elements.done.addEventListener("change", () => toggleDone(elements.done.checked));
    elements.commentForm.addEventListener("submit", addComment);
    elements.commentImageInput.addEventListener("change", () => addCommentImages(elements.commentImageInput.files || []));
    elements.editProduct.addEventListener("click", editProduct);
    elements.duplicateProduct.addEventListener("click", duplicateProduct);
    elements.deleteProduct.addEventListener("click", deleteProduct);

    elements.openProductsPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
    });

    elements.openHomePage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });

    elements.openOrdersPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("order-history.html");
    });

    elements.openAccountPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("account.html");
    });

    elements.missingProductsLink.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    render();
  }

  init();
})();
