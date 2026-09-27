(function () {
  const Store = globalThis.ToDoCartStore;
  // Unicode icons are delivered by the browser/OS, so this catalog stays fully
  // offline and does not require third-party icon APIs or site permissions.
  const LOCAL_ICON_PACK = Object.freeze([
    ["mdi:briefcase-outline", "Briefcase"], ["mdi:home-outline", "Home"],
    ["mdi:shopping-outline", "Shopping"], ["mdi:book-open-page-variant-outline", "Study"],
    ["local:tag", "Tag"], ["local:tools", "Tools"], ["local:car", "Car"],
    ["local:truck", "Delivery"], ["local:computer", "Computer"], ["local:camera", "Camera"],
    ["local:calendar", "Calendar"], ["local:heart", "Heart"], ["local:star", "Star"],
    ["local:lightbulb", "Idea"], ["local:food", "Food"], ["local:travel", "Travel"],
    ["local:health", "Health"], ["local:music", "Music"], ["local:education", "Education"],
    ["local:finance", "Finance"],
    ...[
      ["💰", "Income", "money salary wages revenue earnings cash finance"],
      ["💳", "Payment", "card bill banking debit credit expense"],
      ["📈", "Investment", "stocks shares trading growth profit"],
      ["🏦", "Bank", "banking loan mortgage savings account"],
      ["🧾", "Receipt", "invoice bill tax accounting order"],
      ["🚆", "Train", "railway transit commute"], ["🚲", "Bicycle", "bike cycling exercise"],
      ["🚌", "Bus", "coach public transport"], ["⛽", "Fuel", "petrol diesel gas energy"],
      ["📱", "Phone", "mobile smartphone call telecom"], ["⌚", "Watch", "wearable time clock"],
      ["🎮", "Gaming", "game console controller entertainment"], ["🎧", "Audio", "headphones sound podcast music"],
      ["🖨", "Printer", "print paper scanner office"], ["🔌", "Electronics", "plug power device cable"],
      ["☁", "Cloud", "internet online storage server"], ["🔒", "Security", "lock password privacy safety"],
      ["⚙", "Settings", "gear configuration system"], ["⏰", "Alarm", "reminder deadline timer clock"],
      ["✅", "Task complete", "done finish check todo"], ["📌", "Pin", "important bookmark priority"],
      ["🎯", "Goal", "target objective focus"], ["📋", "List", "checklist notes tasks"],
      ["📁", "Files", "folder document archive"], ["✉", "Mail", "email message letter inbox"],
      ["🔗", "Link", "url website reference web"], ["🌐", "Website", "favicon browser domain internet"],
      ["🏠", "Real estate", "home house property rent"], ["🔑", "Keys", "key access property password"],
      ["☕", "Coffee", "cafe drink beverage"], ["🍔", "Restaurant", "food takeaway delivery"],
      ["🛒", "Groceries", "supermarket market shopping food"], ["🍎", "Health food", "fruit nutrition diet organic"],
      ["🏥", "Hospital", "medical clinic doctor healthcare"], ["💊", "Medicine", "pharmacy prescription treatment"],
      ["🦷", "Dental", "dentist teeth healthcare"], ["🏋", "Fitness", "gym workout exercise sport"],
      ["🧘", "Wellness", "yoga meditation mental health"], ["🎬", "Movies", "film cinema video entertainment"],
      ["🎨", "Art", "design drawing creative paint"], ["📚", "Education", "college university library learning"],
      ["🧪", "Science", "laboratory research chemistry"], ["🧑‍🏫", "Teacher", "tutor class lesson education"],
      ["⚽", "Sports", "football game team athletics"], ["🏆", "Achievement", "trophy award winner success"],
      ["👕", "Clothing", "fashion apparel shirt"], ["👟", "Shoes", "footwear sneakers fashion"],
      ["💄", "Beauty", "makeup cosmetics skincare"], ["🐕", "Pets", "dog cat animal veterinary"],
      ["🌱", "Garden", "plants nature farming"], ["🌞", "Solar", "sun power electricity renewable"],
      ["🔋", "Battery", "energy power charge electric"], ["🏭", "Manufacturing", "factory industry production"],
      ["🏗", "Construction", "building architecture contractor"], ["🧰", "DIY", "toolbox handyman repair"],
      ["🛋", "Furniture", "sofa interior home decor"], ["🛏", "Bedroom", "bed sleep furniture"],
      ["🚿", "Bathroom", "shower plumbing home"], ["🧹", "Cleaning", "clean house chores"],
      ["♻", "Recycling", "waste environment sustainable"], ["🌍", "Environment", "earth climate ecology"],
      ["🗺", "Maps", "location geography directions"], ["🎁", "Gift", "present birthday celebration"],
      ["🎂", "Birthday", "cake party event"], ["💍", "Wedding", "marriage ring ceremony"],
      ["👶", "Baby", "child parenting family"], ["🧳", "Luggage", "suitcase travel packing"],
      ["📦", "Package", "box parcel inventory"], ["🏪", "Storefront", "shop retail business"],
      ["📣", "Marketing", "advertising promotion campaign"], ["🤝", "Partnership", "collaboration client agreement"],
      ["👥", "People", "team customer contact group"], ["📞", "Support", "phone customer service help"],
      ["⚖", "Legal", "law contract justice compliance"], ["🛡", "Insurance", "protection policy coverage"],
      ["🏛", "Government", "public civic authority"], ["🚨", "Emergency", "alert police fire urgent"],
      ["🐞", "Bug", "issue defect software debug"], ["🧩", "Plugin", "extension add-on integration"],
      ["🤖", "AI", "artificial intelligence robot automation"], ["📊", "Analytics", "chart data report metrics"],
      ["🔎", "Search", "find lookup explore"], ["📰", "News", "article media press"],
      ["💬", "Comments", "chat feedback discussion message"], ["📬", "Subscription", "newsletter membership delivery"],
      ["🧠", "Research", "thinking knowledge analysis"], ["🧭", "Navigation", "compass direction route"],
      ["➕", "Add", "add create insert include append"], ["✏", "Edit", "edit write revise update change"],
      ["🗑", "Delete", "delete remove erase discard clear"], ["💾", "Save", "save store keep preserve"],
      ["📤", "Send", "send share submit deliver forward"], ["📥", "Download", "download receive import fetch"],
      ["⬆", "Upload", "upload attach publish"], ["🔍", "Find", "find search discover locate"],
      ["👁", "View", "view see watch inspect preview"], ["▶", "Play", "play start run launch begin"],
      ["⏸", "Pause", "pause wait hold stop"], ["⏹", "Stop", "stop end cancel halt"],
      ["🔄", "Refresh", "refresh reload repeat synchronize sync"], ["↩", "Undo", "undo revert restore back"],
      ["↪", "Redo", "redo forward repeat"], ["✂", "Cut", "cut trim crop split"],
      ["📋", "Copy", "copy duplicate clone reproduce"], ["📌", "Paste", "paste insert clipboard"],
      ["🔀", "Move", "move transfer relocate shift"], ["🔃", "Sort", "sort organize arrange order"],
      ["🔗", "Connect", "connect link join attach integrate"], ["🔓", "Unlock", "unlock open enable allow"],
      ["🔒", "Lock", "lock secure protect restrict"], ["👤", "Login", "login sign in enter authenticate"],
      ["🚪", "Logout", "logout sign out exit leave"], ["✅", "Approve", "approve accept confirm verify"],
      ["❌", "Reject", "reject decline deny refuse"], ["⭐", "Rate", "rate review score evaluate"],
      ["🛒", "Buy", "buy purchase acquire order"], ["🏷", "Sell", "sell offer market trade"],
      ["💬", "Ask", "ask question inquire request"], ["📢", "Announce", "announce notify broadcast alert"],
      ["☎", "Call", "call phone contact ring"], ["🤝", "Meet", "meet collaborate discuss"],
      ["🧑‍🏫", "Teach", "teach train instruct educate"], ["📖", "Learn", "learn study read understand"],
      ["🧠", "Think", "think plan reason imagine"], ["📝", "Write", "write compose draft note"],
      ["📚", "Read", "read review browse"], ["🎨", "Draw", "draw paint design create"],
      ["📷", "Capture", "capture photograph scan record"], ["🎤", "Record", "record speak audio capture"],
      ["🧮", "Calculate", "calculate count compute estimate"], ["📊", "Analyze", "analyze measure assess"],
      ["⚖", "Compare", "compare contrast evaluate"], ["🛠", "Fix", "fix repair resolve troubleshoot"],
      ["🧹", "Clean", "clean clear tidy wash"], ["🏗", "Build", "build make construct develop"],
      ["🚀", "Deploy", "deploy release publish ship launch"], ["🧪", "Test", "test check validate verify"],
      ["🛡", "Protect", "protect defend secure guard"], ["⚡", "Improve", "improve optimize enhance upgrade"],
      ["🎯", "Focus", "focus prioritize target"], ["📅", "Schedule", "schedule plan book arrange"],
      ["⏰", "Remind", "remind notify alert prompt"], ["📦", "Pack", "pack bundle group"],
      ["🚚", "Deliver", "deliver ship transport"], ["🌱", "Grow", "grow cultivate expand"],
      ["❤️", "Like", "like love favorite wish"], ["🎉", "Celebrate", "celebrate enjoy party"],
      ["✈", "Fly", "fly flying airplane aviation air travel"], ["🧳", "Migrate", "migrate migration relocate relocation move abroad"],
      ["🏃", "Run", "run running execute sprint"], ["🚶", "Walk", "walk walking stroll move"],
      ["🧗", "Climb", "climb climbing rise ascent"], ["🏊", "Swim", "swim swimming water"],
      ["🚗", "Drive", "drive driving vehicle operate"], ["🧑‍🍳", "Cook", "cook cooking bake prepare"],
      ["🧵", "Make", "make create craft produce build"], ["🔨", "Construct", "construct assemble fabricate build"],
      ["🎁", "Give", "give donate offer provide"], ["🙌", "Receive", "receive collect accept get"],
      ["🔓", "Open", "open unlock reveal start"], ["🚪", "Close", "close shut end finish"],
      ["🔘", "Select", "select choose pick option"], ["🖱", "Click", "click press tap"],
      ["💡", "Decide", "decide choose determine resolve"], ["🗣", "Speak", "speak talk say voice"],
      ["👂", "Listen", "listen hear audio attend"], ["👀", "Look", "look watch view see"],
      ["🧭", "Explore", "explore discover travel investigate"], ["🔬", "Examine", "examine inspect investigate check"],
      ["🧾", "Pay", "pay payment purchase settle"], ["💸", "Spend", "spend expense cost buy"],
      ["💵", "Earn", "earn income salary profit"], ["🎓", "Graduate", "graduate complete qualify education"],
      ["💼", "Apply", "apply application job submit"], ["🤝", "Hire", "hire recruit employ work"],
      ["🧑‍💻", "Code", "code program develop software"], ["🌐", "Browse", "browse surf navigate website"],
      ["📨", "Reply", "reply respond answer return"], ["🧹", "Organize", "organize arrange tidy sort"],
      ["🧺", "Wash", "wash clean laundry"], ["🌿", "Relax", "relax rest calm unwind"],
      ["😴", "Sleep", "sleep rest bedtime"], ["🩹", "Heal", "heal recover cure health"],
      ["📣", "Promote", "promote market advertise"], ["🧾", "Invoice", "invoice bill charge request"],
      ["🔔", "Notify", "notify alert inform remind"], ["🧠", "Remember", "remember recall retain"],
      ["⚡", "Fast", "fast quick rapid speedy instant"], ["🐢", "Slow", "slow gradual careful"],
      ["⭐", "Important", "important priority key essential urgent"], ["🚨", "Urgent", "urgent emergency immediate critical"],
      ["✅", "Ready", "ready prepared available complete"], ["🔧", "Pending", "pending waiting incomplete in progress"],
      ["🆕", "New", "new fresh recent latest"], ["📦", "Old", "old previous legacy archive"],
      ["👍", "Good", "good positive approved quality"], ["👎", "Bad", "bad negative poor issue"],
      ["✨", "Clean", "clean simple neat clear"], ["🎨", "Colorful", "colorful bright vivid design"],
      ["🌙", "Dark", "dark night black"], ["☀", "Light", "light bright sunny white"],
      ["🔒", "Private", "private hidden confidential secure"], ["🌍", "Public", "public shared open global"],
      ["🆓", "Free", "free no cost available"], ["💎", "Premium", "premium luxury special pro"],
      ["🟢", "Active", "active enabled online live"], ["⚪", "Inactive", "inactive disabled offline paused"],
      ["📈", "Growing", "growing increasing expanding rising"], ["📉", "Declining", "declining decreasing falling"],
      ["🧩", "Related", "related linked connected companion"], ["🎯", "Recommended", "recommended suggested featured"],
      ["🌟", "Popular", "popular trending favorite best"], ["🛡", "Safe", "safe secure protected trusted"]
    ].map(([glyph, label, aliases]) => [`emoji:${glyph}`, label, aliases])
  ]);
  const BUNDLED_ICON_FILES = Object.freeze(["icon-data/tabler.json", "icon-data/mdi.json"]);
  const SEARCH_EQUIVALENTS = Object.freeze({
    aeroplane: "airplane plane flight fly aviation aircraft jet",
    airplane: "aeroplane plane flight fly aviation aircraft jet",
    flight: "fly flying plane airplane aeroplane aviation aircraft",
    fly: "flight flying plane airplane aeroplane aviation aircraft",
    migrate: "migration migrate move relocate relocation travel",
    migration: "migrate move relocate relocation travel"
  });
  let bundledIconPack;
  const state = {
    data: Store.normalizeData({}),
    backupHistory: [],
    previewLayouts: { listing: "grid" },
    activeSettingsTab: new URLSearchParams(window.location.search).get("tab") || "general",
    iconTarget: "new",
    newCategoryIcon: {
      icon: "",
      iconName: ""
    }
  };

  const elements = {
    brandName: document.querySelector(".brand-name"),
    cartCount: document.querySelector("#cart-count"),
    productsCount: document.querySelector("#account-products-count"),
    cartsCount: document.querySelector("#account-carts-count"),
    ordersCount: document.querySelector("#account-orders-count"),
    form: document.querySelector("#settings-form"),
    settingsTabs: document.querySelectorAll("[data-settings-tab]"),
    settingsPanels: document.querySelectorAll("[data-settings-panel]"),
    settingsSaveActions: document.querySelectorAll("[data-settings-save-actions]"),
    accountName: document.querySelector("#setting-account-name"),
    storeName: document.querySelector("#setting-store-name"),
    defaultDepartment: document.querySelector("#setting-default-department"),
    defaultProductType: document.querySelector("#setting-default-product-type"),
    defaultPriorityInputs: document.querySelectorAll("input[name='setting-default-priority']"),
    defaultMoq: document.querySelector("#setting-default-moq"),
    defaultPrice: document.querySelector("#setting-default-price"),
    currency: document.querySelector("#setting-currency"),
    showTimeEquivalent: document.querySelector("#setting-show-time-equivalent"),
    timeSeconds: document.querySelector("#setting-time-seconds"),
    timeRate: document.querySelector("#setting-time-rate"),
    listingShowImages: document.querySelector("#setting-listing-show-images"),
    listingCompactMode: document.querySelector("#setting-listing-compact-mode"),
    cartPageShowManager: document.querySelector("#setting-cart-page-show-manager"),
    cartPageShowProgress: document.querySelector("#setting-cart-page-show-progress"),
    cartPageShowImages: document.querySelector("#setting-cart-page-show-images"),
    cartPageShowDescriptions: document.querySelector("#setting-cart-page-show-descriptions"),
    cartPageShowStock: document.querySelector("#setting-cart-page-show-stock"),
    cartPageShowRemoveButtons: document.querySelector("#setting-cart-page-show-remove-buttons"),
    cartPreviewManager: document.querySelector("#cart-preview-manager"),
    cartPreviewProgress: document.querySelector("#cart-preview-progress"),
    cartPreviewImage: document.querySelector("#cart-preview-image"),
    cartPreviewDescription: document.querySelector("#cart-preview-description"),
    cartPreviewStock: document.querySelector("#cart-preview-stock"),
    cartPreviewRemove: document.querySelector("#cart-preview-remove"),
    checkoutBehavior: document.querySelector("#setting-checkout-behavior"),
    stickyCheckoutShowSummary: document.querySelector("#setting-sticky-checkout-show-summary"),
    stickyCheckoutShowProgress: document.querySelector("#setting-sticky-checkout-show-progress"),
    stickyCheckoutCompact: document.querySelector("#setting-sticky-checkout-compact"),
    stickyCheckoutPreview: document.querySelector("#sticky-checkout-preview"),
    stickyCheckoutPreviewSummary: document.querySelector("#sticky-checkout-preview-summary"),
    stickyCheckoutPreviewProgress: document.querySelector("#sticky-checkout-preview-progress"),
    commentComposerPlacement: document.querySelector("#setting-comment-composer-placement"),
    defaultProductView: document.querySelector("#setting-default-product-view"),
    productsPerPage: document.querySelector("#setting-products-per-page"),
    listingShowProductDescriptions: document.querySelector("#setting-listing-show-product-descriptions"),
    listingShowDeliveryStatus: document.querySelector("#setting-listing-show-delivery-status"),
    listingShowLocationIcon: document.querySelector("#setting-listing-show-location-icon"),
    listingShowTimeIcon: document.querySelector("#setting-listing-show-time-icon"),
    listingShowPrice: document.querySelector("#setting-listing-show-price"),
    listingShowTime: document.querySelector("#setting-listing-show-time"),
    listingShowCategory: document.querySelector("#setting-listing-show-category"),
    listingShowLocation: document.querySelector("#setting-listing-show-location"),
    listingShowRatings: document.querySelector("#setting-listing-show-ratings"),
    listingShowMoq: document.querySelector("#setting-listing-show-moq"),
    listingShowUnits: document.querySelector("#setting-listing-show-units"),
    previewLocationIcon: document.querySelector("#preview-location-icon"),
    previewTimeIcon: document.querySelector("#preview-time-icon"),
    previewProductImage: document.querySelector("#preview-product-image"),
    previewProductDescription: document.querySelector("#preview-product-description"),
    previewDeliveryStatus: document.querySelector("#preview-delivery-status"),
    previewCard: document.querySelector(".settings-product-card-preview"),
    categoryList: document.querySelector("#account-category-list"),
    categoryName: document.querySelector("#account-category-name"),
    addCategory: document.querySelector("#account-add-category"),
    newCategoryIconPreview: document.querySelector("#new-category-icon-preview"),
    chooseNewCategoryIcon: document.querySelector("#new-category-choose-icon"),
    iconPicker: document.querySelector("#icon-picker"),
    closeIconPicker: document.querySelector("#close-icon-picker"),
    iconSearchForm: document.querySelector("#icon-search-form"),
    iconSearchInput: document.querySelector("#icon-search-input"),
    iconSearchStatus: document.querySelector("#icon-search-status"),
    iconSearchResults: document.querySelector("#icon-search-results"),
    resetSettings: document.querySelector("#reset-settings"),
    exportData: document.querySelector("#export-data"),
    importData: document.querySelector("#import-data"),
    importDataFile: document.querySelector("#import-data-file"),
    backupHistoryList: document.querySelector("#backup-history-list"),
    emptyBackupHistory: document.querySelector("#empty-backup-history"),
    status: document.querySelector("#settings-status"),
    openHomePage: document.querySelector("#open-home-page"),
    openProductsPage: document.querySelector("#open-products-page"),
    openOrdersPage: document.querySelector("#open-orders-page"),
    cartJump: document.querySelector("#cart-jump")
  };

  function getActiveCart() {
    return Store.getActiveCart(state.data);
  }

  function setSettingsTab(tabName, updateUrl = true) {
    const validTabs = new Set(["general", "categories", "listing", "cart", "checkout", "popup", "backup"]);
    state.activeSettingsTab = validTabs.has(tabName) ? tabName : "general";
    elements.settingsTabs.forEach((button) => {
      const selected = button.dataset.settingsTab === state.activeSettingsTab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    elements.settingsPanels.forEach((panel) => {
      panel.hidden = panel.dataset.settingsPanel !== state.activeSettingsTab;
    });
    const showSaveActions = ["general", "categories", "listing", "cart", "checkout"].includes(state.activeSettingsTab);
    elements.settingsSaveActions.forEach((element) => {
      element.hidden = !showSaveActions;
    });
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", state.activeSettingsTab);
      window.history.replaceState(null, "", url);
    }
  }

  function getDefaultPriorityValue() {
    return [...elements.defaultPriorityInputs].find((input) => input.checked)?.value || "standard";
  }

  function setDefaultPriorityValue(priority) {
    elements.defaultPriorityInputs.forEach((input) => {
      input.checked = input.value === priority;
    });
  }

  function renderCategoryOptions() {
    const currentValue = elements.defaultDepartment.value || state.data.settings.defaultDepartment;
    elements.defaultDepartment.replaceChildren();

    state.data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      elements.defaultDepartment.append(option);
    });

    elements.defaultDepartment.value = state.data.categories.some((category) => category.id === currentValue)
      ? currentValue
      : state.data.settings.defaultDepartment;
  }

  function createActionIcon(name) {
    const paths = {
      edit: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"],
      search: ["M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z", "m21 21-4.35-4.35"],
      save: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z", "M17 21v-8H7v8", "M7 3v5h8"],
      delete: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v5M14 11v5"]
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("class", "action-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    paths[name].forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.append(path);
    });

    return svg;
  }

  function setActionButtonContent(button, icon, label) {
    button.setAttribute("aria-label", label);
    button.title = label;
    button.replaceChildren(createActionIcon(icon));
  }

  function renderCategoryList() {
    elements.categoryList.replaceChildren();

    state.data.categories.forEach((category) => {
      const item = document.createElement("li");
      item.className = "category-editor";
      item.dataset.categoryId = category.id;

      const preview = document.createElement("div");
      preview.className = "category-icon-preview";
      renderIconPreview(preview, category);

      const label = document.createElement("label");
      label.className = "visually-hidden";
      label.htmlFor = `category-name-${category.id}`;
      label.textContent = `Category name for ${category.name}`;

      const input = document.createElement("input");
      input.id = `category-name-${category.id}`;
      input.className = "category-name-edit";
      input.type = "text";
      input.maxLength = 32;
      input.value = category.name;

      const chooseIcon = document.createElement("button");
      chooseIcon.type = "button";
      chooseIcon.className = "secondary-button category-icon-button button-with-icon";
      chooseIcon.dataset.action = "choose-icon";
      setActionButtonContent(chooseIcon, "search", "Search icons");

      const save = document.createElement("button");
      save.type = "button";
      save.className = "secondary-button category-save-button button-with-icon";
      save.dataset.action = "save-category";
      setActionButtonContent(save, "save", "Save");

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary-button category-delete-button button-with-icon";
      remove.dataset.action = "delete-category";
      remove.disabled = state.data.categories.length === 1;
      setActionButtonContent(remove, "delete", "Delete category");

      item.append(preview, label, input, chooseIcon, save, remove);
      elements.categoryList.append(item);
    });
  }

  function renderIconPreview(container, category) {
    container.replaceChildren();
    const source = Store.getCategoryIconSource(category);

    if (source) {
      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      container.append(image);
      return;
    }

    const fallback = document.createElement("span");
    fallback.textContent = String(category?.name || "+").slice(0, 1).toUpperCase();
    container.append(fallback);
  }

  function renderNewCategoryIcon() {
    renderIconPreview(elements.newCategoryIconPreview, {
      name: elements.categoryName.value || "+",
      ...state.newCategoryIcon
    });
  }

  function renderSettings() {
    const settings = state.data.settings;
    elements.brandName.textContent = settings.storeName;
    renderCategoryOptions();
    renderCategoryList();
    renderNewCategoryIcon();
    elements.accountName.value = settings.accountName;
    elements.storeName.value = settings.storeName;
    elements.defaultDepartment.value = settings.defaultDepartment;
    elements.defaultProductType.value = settings.defaultProductType;
    setDefaultPriorityValue(settings.defaultPriority);
    elements.defaultMoq.value = settings.defaultMoq;
    elements.defaultPrice.value = settings.defaultPrice;
    elements.currency.value = settings.currency;
    elements.showTimeEquivalent.checked = settings.showTimeEquivalent;
    elements.timeSeconds.value = settings.timeSeconds;
    elements.timeRate.value = settings.timeRate;
    elements.checkoutBehavior.value = settings.checkoutBehavior;
    elements.stickyCheckoutShowSummary.checked = settings.stickyCheckoutShowSummary;
    elements.stickyCheckoutShowProgress.checked = settings.stickyCheckoutShowProgress;
    elements.stickyCheckoutCompact.checked = settings.stickyCheckoutCompact;
    elements.cartPageShowManager.checked = settings.cartPageShowManager;
    elements.cartPageShowProgress.checked = settings.cartPageShowProgress;
    elements.cartPageShowImages.checked = settings.cartPageShowImages;
    elements.cartPageShowDescriptions.checked = settings.cartPageShowDescriptions;
    elements.cartPageShowStock.checked = settings.cartPageShowStock;
    elements.cartPageShowRemoveButtons.checked = settings.cartPageShowRemoveButtons;
    elements.listingShowImages.checked = settings.listingShowImages;
    elements.listingCompactMode.checked = settings.listingCompactMode;
    elements.commentComposerPlacement.value = settings.commentComposerPlacement;
    elements.defaultProductView.value = settings.defaultProductView;
    elements.productsPerPage.value = String(settings.productsPerPage);
    elements.listingShowProductDescriptions.checked = settings.listingShowProductDescriptions;
    elements.listingShowDeliveryStatus.checked = settings.listingShowDeliveryStatus;
    elements.listingShowLocationIcon.checked = settings.listingShowLocationIcon;
    elements.listingShowTimeIcon.checked = settings.listingShowTimeIcon;
    elements.listingShowPrice.checked = settings.listingShowPrice;
    elements.listingShowTime.checked = settings.listingShowTime;
    elements.listingShowCategory.checked = settings.listingShowCategory;
    elements.listingShowLocation.checked = settings.listingShowLocation;
    elements.listingShowRatings.checked = settings.listingShowRatings;
    elements.listingShowMoq.checked = settings.listingShowMoq;
    elements.listingShowUnits.checked = settings.listingShowUnits;
    renderCardViewPreview();
    renderCartPagePreview();
    renderStickyCheckoutPreview();
    document.body.classList.toggle("compact-mode", settings.listingCompactMode);
  }

  function renderCardViewPreview() {
    renderCardPreview("listing");
  }

  function renderStickyCheckoutPreview() {
    elements.stickyCheckoutPreview.classList.toggle("is-compact", elements.stickyCheckoutCompact.checked);
    elements.stickyCheckoutPreviewSummary.hidden = !elements.stickyCheckoutShowSummary.checked;
    elements.stickyCheckoutPreviewProgress.hidden = !elements.stickyCheckoutShowProgress.checked;
  }

  function renderCartPagePreview() {
    elements.cartPreviewManager.hidden = !elements.cartPageShowManager.checked;
    elements.cartPreviewProgress.hidden = !elements.cartPageShowProgress.checked;
    elements.cartPreviewImage.hidden = !elements.cartPageShowImages.checked;
    elements.cartPreviewDescription.hidden = !elements.cartPageShowDescriptions.checked;
    elements.cartPreviewStock.hidden = !elements.cartPageShowStock.checked;
    elements.cartPreviewRemove.hidden = !elements.cartPageShowRemoveButtons.checked;
  }

  function renderCardPreview(kind) {
    const prefix = "listing";
    const previewPrefix = "preview";
    const showImages = elements[prefix + "ShowImages"].checked;
    elements[previewPrefix + "LocationIcon"].hidden = !elements[prefix + "ShowLocationIcon"].checked;
    elements[previewPrefix + "TimeIcon"].hidden = !elements[prefix + "ShowTimeIcon"].checked;
    elements[previewPrefix + "ProductImage"].textContent = showImages ? "Product" : "No image";
    elements[previewPrefix + "ProductImage"].classList.toggle("is-placeholder", !showImages);
    elements[previewPrefix + "ProductDescription"].hidden = !elements[prefix + "ShowProductDescriptions"].checked;
    elements[previewPrefix + "DeliveryStatus"].hidden = !elements[prefix + "ShowDeliveryStatus"].checked;
    elements[previewPrefix + "Card"].classList.toggle("is-compact", elements[prefix + "CompactMode"].checked);
    elements[previewPrefix + "Card"].querySelector(".price-label").hidden = !elements[prefix + "ShowPrice"].checked;
    elements[previewPrefix + "Card"].querySelector(".time-label").hidden = !elements[prefix + "ShowTime"].checked;
    elements[previewPrefix + "Card"].querySelector(".department-label").hidden = !elements[prefix + "ShowCategory"].checked;
    elements[previewPrefix + "Card"].querySelector(".location-label").hidden = !elements[prefix + "ShowLocation"].checked;
    elements[previewPrefix + "Card"].querySelector(".settings-preview-rating").hidden = !elements[prefix + "ShowRatings"].checked;
    elements[previewPrefix + "Card"].querySelector(".moq-label").hidden = !elements[prefix + "ShowMoq"].checked;
    elements[previewPrefix + "Card"].querySelector(".units-label").hidden = !elements[prefix + "ShowUnits"].checked;
    elements[previewPrefix + "Card"].classList.toggle("is-list-preview", state.previewLayouts[kind] === "list");
    document.querySelectorAll(`[data-preview-kind="${kind}"]`).forEach((button) => {
      const selected = button.dataset.previewLayout === state.previewLayouts[kind];
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function renderSummary() {
    const activeCart = getActiveCart();
    elements.cartCount.textContent = activeCart.items.length;
    elements.productsCount.textContent = `${state.data.products.length} ${state.data.products.length === 1 ? "product" : "products"}`;
    elements.cartsCount.textContent = `${state.data.carts.length} ${state.data.carts.length === 1 ? "cart" : "carts"}`;
    elements.ordersCount.textContent = `${state.data.orders.length} ${state.data.orders.length === 1 ? "order" : "orders"}`;
  }

  function render() {
    renderSettings();
    renderSummary();
    renderBackupHistory();
    setSettingsTab(state.activeSettingsTab, false);
  }

  function readFormSettings() {
    return Store.normalizeSettings({
      ...state.data.settings,
      accountName: elements.accountName.value,
      storeName: elements.storeName.value,
      defaultDepartment: elements.defaultDepartment.value,
      defaultProductType: elements.defaultProductType.value,
      defaultPriority: getDefaultPriorityValue(),
      defaultMoq: elements.defaultMoq.value,
      defaultPrice: elements.defaultPrice.value,
      currency: elements.currency.value,
      showTimeEquivalent: elements.showTimeEquivalent.checked,
      timeSeconds: elements.timeSeconds.value,
      timeRate: elements.timeRate.value,
      checkoutBehavior: elements.checkoutBehavior.value,
      stickyCheckoutShowSummary: elements.stickyCheckoutShowSummary.checked,
      stickyCheckoutShowProgress: elements.stickyCheckoutShowProgress.checked,
      stickyCheckoutCompact: elements.stickyCheckoutCompact.checked,
      cartPageShowManager: elements.cartPageShowManager.checked,
      cartPageShowProgress: elements.cartPageShowProgress.checked,
      cartPageShowImages: elements.cartPageShowImages.checked,
      cartPageShowDescriptions: elements.cartPageShowDescriptions.checked,
      cartPageShowStock: elements.cartPageShowStock.checked,
      cartPageShowRemoveButtons: elements.cartPageShowRemoveButtons.checked,
      listingShowImages: elements.listingShowImages.checked,
      listingCompactMode: elements.listingCompactMode.checked,
      commentComposerPlacement: elements.commentComposerPlacement.value,
      defaultProductView: elements.defaultProductView.value,
      productsPerPage: elements.productsPerPage.value,
      listingShowProductDescriptions: elements.listingShowProductDescriptions.checked,
      listingShowDeliveryStatus: elements.listingShowDeliveryStatus.checked,
      listingShowLocationIcon: elements.listingShowLocationIcon.checked,
      listingShowTimeIcon: elements.listingShowTimeIcon.checked,
      listingShowPrice: elements.listingShowPrice.checked,
      listingShowTime: elements.listingShowTime.checked,
      listingShowCategory: elements.listingShowCategory.checked,
      listingShowLocation: elements.listingShowLocation.checked,
      listingShowRatings: elements.listingShowRatings.checked,
      listingShowMoq: elements.listingShowMoq.checked,
      listingShowUnits: elements.listingShowUnits.checked
    }, state.data.categories);
  }

  function showStatus(message) {
    elements.status.textContent = message;
    window.setTimeout(() => {
      if (elements.status.textContent === message) {
        elements.status.textContent = "";
      }
    }, 2200);
  }

  async function saveSettings(event) {
    event.preventDefault();
    state.data.settings = readFormSettings();
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Settings saved.");
  }

  async function addCategoryFromInput() {
    const name = elements.categoryName.value.trim();

    if (!name) {
      return;
    }

    const existing = state.data.categories.find((category) => (
      category.name.toLowerCase() === name.toLowerCase()
    ));
    const category = existing || Store.createCategory({
      name,
      icon: state.newCategoryIcon.icon,
      iconName: state.newCategoryIcon.iconName
    }, state.data.categories);

    if (!existing) {
      state.data.categories.push(category);
    }

    state.data.settings.defaultDepartment = category.id;
    elements.categoryName.value = "";
    state.newCategoryIcon = { icon: "", iconName: "" };
    state.data = await Store.saveData(state.data);
    render();
    showStatus(existing ? "Category already exists." : "Category added.");
  }

  async function saveCategoryEdit(categoryId, name) {
    const nextName = name.trim();

    if (!nextName) {
      showStatus("Category name cannot be empty.");
      return;
    }

    const duplicate = state.data.categories.some((category) => (
      category.id !== categoryId && category.name.toLowerCase() === nextName.toLowerCase()
    ));

    if (duplicate) {
      showStatus("A category with that name already exists.");
      return;
    }

    state.data.categories = state.data.categories.map((category) => (
      category.id === categoryId ? { ...category, name: nextName } : category
    ));
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Category updated.");
  }

  async function deleteCategory(categoryId) {
    if (state.data.categories.length <= 1) {
      showStatus("Keep at least one category.");
      return;
    }

    const category = state.data.categories.find((entry) => entry.id === categoryId);
    if (!category || !window.confirm(`Delete ${category.name}? Products in this category will move to another category.`)) {
      return;
    }

    const replacement = state.data.categories.find((entry) => entry.id !== categoryId);
    state.data.categories = state.data.categories.filter((entry) => entry.id !== categoryId);
    state.data.products = state.data.products.map((product) => (
      product.department === categoryId ? { ...product, department: replacement.id } : product
    ));
    if (state.data.settings.defaultDepartment === categoryId) {
      state.data.settings.defaultDepartment = replacement.id;
    }
    state.data = await Store.saveData(state.data);
    render();
    showStatus(`${category.name} deleted. Products moved to ${replacement.name}.`);
  }

  function openIconPicker(categoryId = "new") {
    state.iconTarget = categoryId;
    const category = categoryId === "new"
      ? { name: elements.categoryName.value }
      : state.data.categories.find((entry) => entry.id === categoryId);
    elements.iconSearchInput.value = category?.name || "";
    elements.iconSearchResults.replaceChildren();
    elements.iconSearchStatus.textContent = "Search 13,000+ bundled offline icons, including emoji. No network access is used.";
    elements.iconPicker.showModal();
    elements.iconSearchInput.focus();

    if (elements.iconSearchInput.value.trim()) {
      searchIcons();
    }
  }

  function closeIconPicker() {
    elements.iconPicker.close();
  }

  function humanizeIconName(iconName) {
    const name = iconName.split(":").pop() || iconName;
    return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function loadBundledIconPack() {
    if (bundledIconPack) {
      return bundledIconPack;
    }

    try {
      const collections = await Promise.all(BUNDLED_ICON_FILES.map(async (file) => {
        const response = await fetch(chrome.runtime.getURL(file));
        if (!response.ok) {
          throw new Error(`Unable to load ${file}`);
        }
        return response.json();
      }));
      bundledIconPack = collections.flatMap((collection) => {
        Store.registerBundledIconCollection(collection);
        return Object.keys(collection.icons || {}).map((name) => {
          const label = humanizeIconName(name);
          return [`${collection.prefix}:${name}`, label, `${name.replace(/[-_]+/g, " ")} ${collection.prefix}`.toLocaleLowerCase()];
        });
      });
    } catch (error) {
      console.warn("Unable to load bundled icon collections.", error);
      bundledIconPack = [];
    }

    return bundledIconPack;
  }

  async function searchIcons(event) {
    event?.preventDefault();
    const query = elements.iconSearchInput.value.trim();

    if (query.length < 2) {
      elements.iconSearchStatus.textContent = "Enter at least two letters to search.";
      elements.iconSearchResults.replaceChildren();
      return;
    }

    elements.iconSearchResults.replaceChildren();
    elements.iconSearchStatus.textContent = "Searching bundled offline icons…";
    const normalizedQuery = query.toLocaleLowerCase();
    const searchTerms = [normalizedQuery, ...(SEARCH_EQUIVALENTS[normalizedQuery] || "").split(" ").filter(Boolean)];
    const iconPack = [...LOCAL_ICON_PACK, ...await loadBundledIconPack()];
    const icons = iconPack.filter(([iconName, label, aliases = ""]) => (
      searchTerms.some((term) => (
        iconName.toLocaleLowerCase().includes(term)
        || label.toLocaleLowerCase().includes(term)
        || aliases.includes(term)
      ))
    ));
    const visibleIcons = icons.length ? icons.slice(0, 72) : [["emoji:🏷", `Category: ${query}`]];
    elements.iconSearchStatus.textContent = icons.length
      ? `${icons.length.toLocaleString()} bundled offline icons found. Choose one to save it with the category.`
      : "No exact bundled icon found. A general category icon is available.";

    visibleIcons.forEach(([iconName, labelText]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "icon-result";
      button.dataset.iconName = iconName;
      button.setAttribute("role", "option");
      button.title = labelText;

      const image = document.createElement("img");
      image.src = Store.getCategoryIconSource({ iconName });
      image.alt = "";

      const label = document.createElement("span");
      label.textContent = labelText;
      button.append(image, label);
      elements.iconSearchResults.append(button);
    });
  }

  async function chooseIcon(iconName) {
    elements.iconSearchStatus.textContent = "Saving icon…";

    try {
      const icon = Store.getCategoryIconSource({ iconName });

      if (state.iconTarget === "new") {
        state.newCategoryIcon = { icon, iconName };
        renderNewCategoryIcon();
      } else {
        state.data.categories = state.data.categories.map((category) => (
          category.id === state.iconTarget ? { ...category, icon, iconName } : category
        ));
        state.data = await Store.saveData(state.data);
        render();
        showStatus("Category icon updated.");
      }

      closeIconPicker();
    } catch (error) {
      elements.iconSearchStatus.textContent = "That icon could not be saved. Try another icon.";
    }
  }

  async function resetSettings() {
    const popupSettings = Object.fromEntries(
      Object.entries(state.data.settings).filter(([key]) => key.startsWith("popup"))
    );
    state.data.settings = Store.normalizeSettings(popupSettings, state.data.categories);
    state.data = await Store.saveData(state.data);
    render();
    showStatus("Defaults restored.");
  }

  function createBackup(data, timestamp = Date.now()) {
    return {
      format: "todo-list-cart-backup",
      version: 1,
      exportedAt: new Date(timestamp).toISOString(),
      data: JSON.parse(JSON.stringify(data))
    };
  }

  function getBackupFileName(timestamp = Date.now()) {
    return `todo-list-cart-backup-${new Date(timestamp).toISOString().slice(0, 10)}.json`;
  }

  function downloadBackup(backup, fileName) {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function recordBackupEvent(type, backup, sourceName) {
    const entry = {
      id: Store.createId("backup"),
      type,
      createdAt: Date.now(),
      sourceName,
      backup
    };
    state.backupHistory = await Store.saveBackupHistory([entry, ...state.backupHistory]);
    renderBackupHistory();
    return entry;
  }

  function renderBackupHistory() {
    elements.backupHistoryList.replaceChildren();
    const records = state.backupHistory.filter((entry) => entry?.backup?.data);

    records.forEach((entry) => {
      const item = document.createElement("li");
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      const actions = document.createElement("div");
      const restore = document.createElement("button");
      const download = document.createElement("button");
      const actionLabel = entry.type === "import"
        ? "Imported"
        : entry.type === "restore"
          ? "Restored"
          : "Exported";

      title.textContent = `${actionLabel}: ${entry.sourceName || "Local backup"}`;
      detail.textContent = Store.formatDateTime(entry.createdAt);
      copy.append(title, detail);
      actions.className = "backup-history-actions";
      restore.type = "button";
      restore.className = "secondary-button";
      restore.textContent = "Restore";
      restore.addEventListener("click", () => restoreBackup(entry.id));
      download.type = "button";
      download.className = "secondary-button";
      download.textContent = "Download copy";
      download.addEventListener("click", () => downloadBackup(
        entry.backup,
        entry.sourceName || getBackupFileName(entry.createdAt)
      ));
      actions.append(restore, download);
      item.append(copy, actions);
      elements.backupHistoryList.append(item);
    });

    elements.emptyBackupHistory.hidden = records.length > 0;
  }

  async function restoreBackup(entryId) {
    const entry = state.backupHistory.find((record) => record.id === entryId);
    if (!entry?.backup?.data) {
      showStatus("That local backup is no longer available.");
      return;
    }
    if (!window.confirm("Restore this local backup? It will replace the current products, carts, orders, categories, and settings.")) {
      return;
    }

    state.data = await Store.saveData(Store.normalizeData(entry.backup.data));
    await recordBackupEvent("restore", createBackup(state.data), entry.sourceName || "Local backup");
    render();
    showStatus("Local backup restored.");
  }

  async function exportData() {
    const timestamp = Date.now();
    const fileName = getBackupFileName(timestamp);
    const backup = createBackup(state.data, timestamp);
    await recordBackupEvent("export", backup, fileName);
    downloadBackup(backup, fileName);
    showStatus("Backup exported and saved to local history.");
  }

  async function importDataFile() {
    const file = elements.importDataFile.files?.[0];

    if (!file) {
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Backup files must be smaller than 5 MB.");
      }

      const parsed = JSON.parse(await file.text());
      const importedData = parsed?.format === "todo-list-cart-backup" ? parsed.data : parsed;
      const hasStoreData = importedData
        && typeof importedData === "object"
        && ["products", "categories", "carts", "orders", "settings"]
          .some((key) => Object.prototype.hasOwnProperty.call(importedData, key));

      if (!hasStoreData) {
        throw new Error("This file is not a ToDoList Cart backup.");
      }

      if (!window.confirm("Import this backup? It will replace the current products, carts, orders, categories, and settings.")) {
        return;
      }

      state.data = await Store.saveData(Store.normalizeData(importedData));
      await recordBackupEvent("import", createBackup(state.data), file.name || "Imported backup");
      render();
      showStatus("Backup imported and saved to local history.");
    } catch (error) {
      showStatus(error instanceof Error ? error.message : "The backup could not be imported.");
    } finally {
      elements.importDataFile.value = "";
    }
  }

  function bindEvents() {
    elements.form.addEventListener("submit", saveSettings);
    elements.settingsTabs.forEach((button) => {
      button.addEventListener("click", () => setSettingsTab(button.dataset.settingsTab));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const tabs = [...elements.settingsTabs];
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (tabs.indexOf(button) + direction + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        setSettingsTab(tabs[nextIndex].dataset.settingsTab);
      });
    });
    elements.resetSettings.addEventListener("click", resetSettings);
    elements.exportData.addEventListener("click", exportData);
    elements.importData.addEventListener("click", () => elements.importDataFile.click());
    elements.importDataFile.addEventListener("change", importDataFile);
    document.querySelectorAll("[data-preview-layout]").forEach((button) => {
      button.addEventListener("click", () => {
        state.previewLayouts[button.dataset.previewKind] = button.dataset.previewLayout;
        renderCardPreview(button.dataset.previewKind);
      });
    });
    [
      elements.listingShowImages, elements.listingCompactMode, elements.listingShowProductDescriptions,
      elements.listingShowDeliveryStatus, elements.listingShowLocationIcon, elements.listingShowTimeIcon,
      elements.listingShowPrice, elements.listingShowTime,
      elements.listingShowCategory, elements.listingShowLocation,
      elements.listingShowRatings, elements.listingShowMoq, elements.listingShowUnits
    ].forEach((input) => input.addEventListener("change", renderCardViewPreview));
    [
      elements.stickyCheckoutShowSummary,
      elements.stickyCheckoutShowProgress,
      elements.stickyCheckoutCompact
    ].forEach((input) => input.addEventListener("change", renderStickyCheckoutPreview));
    [
      elements.cartPageShowManager,
      elements.cartPageShowProgress,
      elements.cartPageShowImages,
      elements.cartPageShowDescriptions,
      elements.cartPageShowStock,
      elements.cartPageShowRemoveButtons
    ].forEach((input) => input.addEventListener("change", renderCartPagePreview));
    elements.addCategory.addEventListener("click", addCategoryFromInput);
    elements.chooseNewCategoryIcon.addEventListener("click", () => openIconPicker("new"));
    elements.categoryName.addEventListener("input", renderNewCategoryIcon);
    elements.categoryList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");

      if (!button) {
        return;
      }

      const item = button.closest(".category-editor");
      const categoryId = item.dataset.categoryId;

      if (button.dataset.action === "choose-icon") {
        openIconPicker(categoryId);
      }

      if (button.dataset.action === "save-category") {
        saveCategoryEdit(categoryId, item.querySelector(".category-name-edit").value);
      }

      if (button.dataset.action === "delete-category") {
        deleteCategory(categoryId);
      }
    });
    elements.categoryList.addEventListener("keydown", (event) => {
      const input = event.target.closest(".category-name-edit");

      if (input && event.key === "Enter") {
        event.preventDefault();
        saveCategoryEdit(input.closest(".category-editor").dataset.categoryId, input.value);
      }
    });
    elements.iconSearchForm.addEventListener("submit", searchIcons);
    elements.closeIconPicker.addEventListener("click", closeIconPicker);
    elements.iconSearchResults.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-icon-name]");

      if (button) {
        chooseIcon(button.dataset.iconName);
      }
    });
    elements.iconPicker.addEventListener("click", (event) => {
      if (event.target === elements.iconPicker) {
        closeIconPicker();
      }
    });
    elements.categoryName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategoryFromInput();
      }
    });

    elements.openHomePage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("newtab.html");
    });

    elements.openProductsPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("products.html");
    });

    elements.openOrdersPage.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("order-history.html");
    });

    elements.cartJump.addEventListener("click", () => {
      window.location.href = Store.getExtensionUrl("cart.html");
    });
  }

  async function init() {
    bindEvents();
    [state.data, state.backupHistory] = await Promise.all([
      Store.loadData(),
      Store.loadBackupHistory()
    ]);
    render();
  }

  init();
})();
