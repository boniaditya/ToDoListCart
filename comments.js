(function () {
  const Store = globalThis.ToDoCartStore;
  const state = { data: Store.normalizeData({}) };
  const elements = {
    brandName: document.querySelector(".brand-name"),
    cartCount: document.querySelector("#cart-count"),
    totalCount: document.querySelector("#comments-total-count"),
    productCount: document.querySelector("#comments-product-count"),
    list: document.querySelector("#comments-trail-list"),
    empty: document.querySelector("#empty-comment-trails")
  };

  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

  function getCommentTrails() {
    return state.data.products.flatMap((product) => (
      (product.comments || []).map((comment) => ({ product, comment }))
    )).sort((first, second) => second.comment.createdAt - first.comment.createdAt);
  }

  function renderTrailItem({ product, comment }) {
    const item = document.createElement("li");
    const thumbnail = document.createElement("a");
    const header = document.createElement("div");
    const content = document.createElement("div");
    const title = document.createElement("a");
    const meta = document.createElement("span");
    const body = document.createElement("p");
    const imageCount = document.createElement("span");
    const productLink = document.createElement("a");
    const detailUrl = `product.html?id=${encodeURIComponent(product.id)}&tab=comments`;

    item.className = "comments-trail-item";
    thumbnail.href = detailUrl;
    thumbnail.className = "comments-trail-thumbnail";
    thumbnail.setAttribute("aria-label", `Open ${product.title} comments`);
    if (product.images?.[0]?.src) {
      const image = document.createElement("img");
      image.src = product.images[0].src;
      image.alt = product.title;
      thumbnail.append(image);
    } else {
      thumbnail.textContent = "Product";
      thumbnail.classList.add("is-placeholder");
    }
    title.href = detailUrl;
    title.textContent = comment.title || "Untitled comment";
    meta.textContent = `${product.title} · ${Store.getCategoryLabel(state.data, product.department)} · ${Store.formatDateTime(comment.createdAt)}`;
    header.className = "comments-trail-header";
    header.append(title, meta);
    body.textContent = comment.text || "No comment text added.";
    productLink.href = detailUrl;
    productLink.className = "comments-trail-product-link";
    productLink.textContent = "Open product comments";
    if (comment.images?.length) {
      imageCount.className = "comments-trail-images";
      imageCount.textContent = plural(comment.images.length, "image");
      content.append(header, body, imageCount, productLink);
    } else {
      content.append(header, body, productLink);
    }
    content.className = "comments-trail-content";
    item.append(thumbnail, content);

    return item;
  }

  function render() {
    const activeCart = Store.getActiveCart(state.data);
    const trails = getCommentTrails();
    const commentedProducts = new Set(trails.map((entry) => entry.product.id));

    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = activeCart.items.length;
    elements.totalCount.textContent = plural(trails.length, "comment");
    elements.productCount.textContent = `${commentedProducts.size} ${commentedProducts.size === 1 ? "product" : "products"} with comments`;
    elements.list.replaceChildren(...trails.map(renderTrailItem));
    elements.empty.hidden = trails.length > 0;
  }

  async function init() {
    state.data = await Store.loadData();
    render();
    globalThis.chrome?.storage?.onChanged?.addListener(async (_changes, areaName) => {
      if (areaName !== "local") return;
      state.data = await Store.loadData();
      render();
    });
  }

  init();
})();
