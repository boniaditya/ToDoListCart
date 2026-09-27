(function () {
  const Store = globalThis.ToDoCartStore;
  const state = {
    data: Store.normalizeData({}),
    query: "",
    productQuery: "",
    selectedProductIds: new Set()
  };
  const elements = {
    brandName: document.querySelector(".brand-name"),
    departments: document.querySelector(".departments"),
    cartCount: document.querySelector("#cart-count"),
    vendorCount: document.querySelector("#vendor-count"),
    productCount: document.querySelector("#vendor-product-count"),
    contactCount: document.querySelector("#vendor-contact-count"),
    form: document.querySelector("#vendor-form"),
    formTitle: document.querySelector("#vendor-form-title"),
    vendorId: document.querySelector("#vendor-id"),
    name: document.querySelector("#vendor-name"),
    type: document.querySelector("#vendor-type"),
    phone: document.querySelector("#vendor-phone"),
    email: document.querySelector("#vendor-email"),
    website: document.querySelector("#vendor-website"),
    address: document.querySelector("#vendor-address"),
    productSearch: document.querySelector("#vendor-product-picker-search"),
    products: document.querySelector("#vendor-products"),
    notes: document.querySelector("#vendor-notes"),
    contactRows: document.querySelector("#vendor-contact-rows"),
    contactTemplate: document.querySelector("#vendor-contact-row-template"),
    addContact: document.querySelector("#add-vendor-contact"),
    cancelEdit: document.querySelector("#cancel-vendor-edit"),
    status: document.querySelector("#vendor-form-status"),
    search: document.querySelector("#vendor-search"),
    list: document.querySelector("#vendor-list"),
    empty: document.querySelector("#empty-vendors"),
    cardTemplate: document.querySelector("#vendor-card-template")
  };

  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;
  const vendorTypeLabel = (type) => ({ person: "Individual", organization: "Organization", business: "Business" }[type] || "Business");

  function renderCategories() {
    elements.departments.replaceChildren();
    const all = document.createElement("a");
    all.href = "newtab.html";
    all.textContent = "All";
    elements.departments.append(all);
    state.data.categories.forEach((category) => {
      const link = document.createElement("a");
      link.href = `newtab.html?department=${encodeURIComponent(category.id)}`;
      Store.renderCategory(link, state.data, category.id);
      elements.departments.append(link);
    });
  }

  function syncSelectedProductIds() {
    elements.products.querySelectorAll("option").forEach((option) => {
      if (option.selected) {
        state.selectedProductIds.add(option.value);
      } else {
        state.selectedProductIds.delete(option.value);
      }
    });
  }

  function renderProductOptions(selectedIds = state.selectedProductIds) {
    const selected = new Set(selectedIds);
    const query = state.productQuery.toLowerCase();
    const options = state.data.products
      .slice()
      .filter((product) => {
        if (!query) return true;
        return [
          product.title,
          product.description,
          Store.getCategoryLabel(state.data, product.department)
        ].some((value) => String(value || "").toLowerCase().includes(query));
      })
      .sort((first, second) => first.title.localeCompare(second.title))
      .map((product) => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = `${product.title} — ${Store.getCategoryLabel(state.data, product.department)}`;
        option.selected = selected.has(product.id);
        return option;
      });
    if (!options.length) {
      const empty = document.createElement("option");
      empty.disabled = true;
      empty.textContent = "No matching products";
      options.push(empty);
    }
    elements.products.replaceChildren(...options);
  }

  function addContactRow(contact = {}) {
    const row = elements.contactTemplate.content.firstElementChild.cloneNode(true);
    row.querySelectorAll("[data-contact-field]").forEach((input) => {
      input.value = contact[input.dataset.contactField] || "";
    });
    elements.contactRows.append(row);
  }

  function getContactRows() {
    return [...elements.contactRows.querySelectorAll(".vendor-contact-row")].map((row) => {
      const value = (field) => row.querySelector(`[data-contact-field='${field}']`).value.trim();
      return { id: value("id") || Store.createId("spoc"), name: value("name"), role: value("role"), phone: value("phone"), email: value("email") };
    }).filter((contact) => contact.name || contact.role || contact.phone || contact.email);
  }

  function resetForm(message = "") {
    elements.form.reset();
    elements.vendorId.value = "";
    elements.type.value = "business";
    elements.contactRows.replaceChildren();
    state.productQuery = "";
    state.selectedProductIds = new Set();
    elements.productSearch.value = "";
    renderProductOptions();
    elements.formTitle.textContent = "Add vendor";
    document.querySelector("#save-vendor").textContent = "Save Vendor";
    elements.cancelEdit.hidden = true;
    elements.status.textContent = message;
  }

  function createContactLink(kind, value) {
    const link = document.createElement("a");
    link.href = kind === "email" ? `mailto:${value}` : `tel:${value.replace(/[^+\d]/g, "")}`;
    link.textContent = value;
    return link;
  }

  function renderVendor(vendor, productsById) {
    const card = elements.cardTemplate.content.firstElementChild.cloneNode(true);
    const heading = card.querySelector("h3");
    const type = card.querySelector(".vendor-type-badge");
    const directContact = card.querySelector(".vendor-direct-contact");
    const address = card.querySelector(".vendor-address");
    const productLinks = card.querySelector(".vendor-product-links");
    const spocList = card.querySelector(".vendor-spoc-list");
    const notes = card.querySelector(".vendor-notes");
    card.dataset.vendorId = vendor.id;
    heading.textContent = vendor.name;
    type.textContent = vendorTypeLabel(vendor.type);

    if (vendor.phone) directContact.append(createContactLink("phone", vendor.phone));
    if (vendor.email) directContact.append(createContactLink("email", vendor.email));
    if (vendor.website) {
      const link = document.createElement("a");
      link.href = vendor.website;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Website";
      directContact.append(link);
    }
    directContact.hidden = directContact.childElementCount === 0;
    address.textContent = vendor.address;
    address.hidden = !vendor.address;

    vendor.productIds.forEach((productId) => {
      const product = productsById.get(productId);
      if (!product) return;
      const link = document.createElement("a");
      link.href = `product.html?id=${encodeURIComponent(product.id)}`;
      link.textContent = product.title;
      productLinks.append(link);
    });
    if (!productLinks.childElementCount) {
      const empty = document.createElement("span");
      empty.textContent = "No products linked";
      productLinks.append(empty);
    }

    vendor.contacts.forEach((contact) => {
      const item = document.createElement("article");
      const identity = document.createElement("div");
      const name = document.createElement("b");
      const role = document.createElement("span");
      const links = document.createElement("div");
      name.textContent = contact.name || "Unnamed SPOC";
      role.textContent = contact.role;
      identity.append(name, role);
      if (contact.phone) links.append(createContactLink("phone", contact.phone));
      if (contact.email) links.append(createContactLink("email", contact.email));
      item.append(identity, links);
      spocList.append(item);
    });
    if (!spocList.childElementCount) {
      const empty = document.createElement("span");
      empty.textContent = "No SPOCs added";
      spocList.append(empty);
    }
    notes.textContent = vendor.notes;
    notes.hidden = !vendor.notes;
    return card;
  }

  function getVisibleVendors() {
    const query = state.query.toLowerCase();
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    if (!query) return state.data.vendors;
    return state.data.vendors.filter((vendor) => [
      vendor.name, vendor.type, vendor.phone, vendor.email, vendor.website, vendor.address, vendor.notes,
      ...vendor.productIds.map((id) => productsById.get(id)?.title || ""),
      ...vendor.contacts.flatMap((contact) => [contact.name, contact.role, contact.phone, contact.email])
    ].some((value) => String(value).toLowerCase().includes(query)));
  }

  function render() {
    const productsById = new Map(state.data.products.map((product) => [product.id, product]));
    const vendors = getVisibleVendors();
    const linkedProducts = new Set(state.data.vendors.flatMap((vendor) => vendor.productIds));
    const contactTotal = state.data.vendors.reduce((total, vendor) => total + vendor.contacts.length, 0);
    const activeCart = Store.getActiveCart(state.data);
    elements.brandName.textContent = state.data.settings.storeName;
    elements.cartCount.textContent = String(activeCart.items.length);
    elements.vendorCount.textContent = plural(state.data.vendors.length, "vendor");
    elements.productCount.textContent = `${linkedProducts.size} linked ${linkedProducts.size === 1 ? "product" : "products"}`;
    elements.contactCount.textContent = `${contactTotal} ${contactTotal === 1 ? "SPOC" : "SPOCs"}`;
    elements.list.replaceChildren(...vendors.map((vendor) => renderVendor(vendor, productsById)));
    elements.empty.hidden = vendors.length > 0;
    renderCategories();
  }

  async function persist(message = "") {
    state.data = await Store.saveData(state.data);
    render();
    resetForm(message);
  }

  async function saveVendor(event) {
    event.preventDefault();
    syncSelectedProductIds();
    const current = state.data.vendors.find((vendor) => vendor.id === elements.vendorId.value);
    const vendorData = {
      id: current?.id,
      name: elements.name.value.trim(),
      type: elements.type.value,
      phone: elements.phone.value.trim(),
      email: elements.email.value.trim(),
      website: elements.website.value.trim(),
      address: elements.address.value.trim(),
      notes: elements.notes.value.trim(),
      productIds: [...state.selectedProductIds],
      contacts: getContactRows(),
      createdAt: current?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    const vendor = current ? Store.normalizeVendor(vendorData) : Store.createVendor(vendorData);
    state.data.vendors = current
      ? state.data.vendors.map((entry) => entry.id === current.id ? vendor : entry)
      : [vendor, ...state.data.vendors];
    await persist(current ? "Vendor updated." : "Vendor added.");
  }

  function editVendor(vendorId) {
    const vendor = state.data.vendors.find((entry) => entry.id === vendorId);
    if (!vendor) return;
    elements.vendorId.value = vendor.id;
    elements.name.value = vendor.name;
    elements.type.value = vendor.type;
    elements.phone.value = vendor.phone;
    elements.email.value = vendor.email;
    elements.website.value = vendor.website;
    elements.address.value = vendor.address;
    elements.notes.value = vendor.notes;
    state.productQuery = "";
    state.selectedProductIds = new Set(vendor.productIds);
    elements.productSearch.value = "";
    renderProductOptions();
    elements.contactRows.replaceChildren();
    vendor.contacts.forEach(addContactRow);
    elements.formTitle.textContent = "Edit vendor";
    document.querySelector("#save-vendor").textContent = "Update Vendor";
    elements.cancelEdit.hidden = false;
    elements.status.textContent = "";
    elements.name.focus();
    document.querySelector(".vendor-editor").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteVendor(vendorId) {
    const vendor = state.data.vendors.find((entry) => entry.id === vendorId);
    if (!vendor || !window.confirm(`Delete ${vendor.name}?`)) return;
    state.data.vendors = state.data.vendors.filter((entry) => entry.id !== vendorId);
    await persist("Vendor deleted.");
  }

  function bindEvents() {
    elements.form.addEventListener("submit", saveVendor);
    elements.addContact.addEventListener("click", () => addContactRow());
    elements.cancelEdit.addEventListener("click", () => resetForm());
    elements.productSearch.addEventListener("input", () => {
      syncSelectedProductIds();
      state.productQuery = elements.productSearch.value.trim();
      renderProductOptions();
    });
    elements.products.addEventListener("change", syncSelectedProductIds);
    elements.contactRows.addEventListener("click", (event) => {
      const remove = event.target.closest(".remove-vendor-contact");
      if (remove) remove.closest(".vendor-contact-row").remove();
    });
    elements.search.addEventListener("input", () => {
      state.query = elements.search.value.trim();
      render();
    });
    elements.list.addEventListener("click", (event) => {
      const card = event.target.closest(".vendor-card");
      if (!card) return;
      if (event.target.closest(".edit-vendor")) editVendor(card.dataset.vendorId);
      if (event.target.closest(".delete-vendor")) deleteVendor(card.dataset.vendorId);
    });
  }

  async function init() {
    bindEvents();
    state.data = await Store.loadData();
    renderProductOptions();
    render();
    globalThis.chrome?.storage?.onChanged?.addListener(async (_changes, areaName) => {
      if (areaName !== "local") return;
      state.data = await Store.loadData();
      render();
    });
  }

  init();
})();
