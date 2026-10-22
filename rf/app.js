const categoryButtons = document.querySelectorAll(".category-button");
const menuCards = document.querySelectorAll(".menu-card");
const emptyMessage = document.querySelector("#menu-empty");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const imageViewer = document.querySelector("#image-viewer");
const previewImage = imageViewer.querySelector("img");
const previewCaption = imageViewer.querySelector("p");
const closePreview = imageViewer.querySelector(".image-viewer-close");
const cart = new Map();
const cartTrigger = document.querySelector("#cart-trigger");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartSubtotal = document.querySelector("#cart-subtotal");
const checkoutDialog = document.querySelector("#checkout-dialog");
const checkoutForm = document.querySelector("#checkout-form");
const orderStatus = document.querySelector("#order-status");
const checkoutSubmit = document.querySelector("#checkout-submit");
const whatsappSubmit = document.querySelector("#whatsapp-submit");
const smsSubmit = document.querySelector("#sms-submit");
const checkoutStatus = document.querySelector("#checkout-status");
const whatsappNumber = "233537087035";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);

const resetWhatsAppLink = () => {
  whatsappSubmit.hidden = true;
  whatsappSubmit.href = "#";
  smsSubmit.hidden = true;
  smsSubmit.href = "#";
  checkoutSubmit.hidden = false;
  checkoutStatus.textContent = "";
};

menuCards.forEach((card) => {
  const price = Number(card.dataset.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Menu item has an invalid price: ${card.querySelector("h3").textContent}`);
  }

  const priceLabel = card.querySelector(".card-price");
  priceLabel.textContent = formatPrice(price);

  const orderLink = card.querySelector(".card-order");
  const itemName = card.querySelector("h3").textContent;
  const message = `Hello RoyalTaste, I would like to order ${itemName}. The estimated item price is ${formatPrice(price)}; please confirm availability and the final price.`;
  const itemActions = document.createElement("div");
  itemActions.className = "card-order-actions";

  const addButton = document.createElement("button");
  addButton.className = "card-add-button add-to-cart";
  addButton.type = "button";
  addButton.textContent = "Add to order";

  const contactActions = document.createElement("div");
  contactActions.className = "card-contact-actions";

  const whatsappLink = document.createElement("a");
  whatsappLink.className = "card-contact-link card-whatsapp-link";
  whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "WhatsApp";

  const phoneLink = document.createElement("a");
  phoneLink.className = "card-contact-link card-phone-link";
  phoneLink.href = `tel:+${whatsappNumber}`;
  phoneLink.textContent = "Call to order";

  const smsLink = document.createElement("a");
  smsLink.className = "card-contact-link card-sms-link";
  smsLink.href = `sms:+${whatsappNumber}?body=${encodeURIComponent(message)}`;
  smsLink.textContent = "SMS";

  contactActions.append(whatsappLink, phoneLink, smsLink);
  itemActions.append(addButton, contactActions);
  orderLink.replaceWith(itemActions);
});

const renderCart = () => {
  cartItems.replaceChildren();
  let itemCount = 0;
  let subtotal = 0;

  cart.forEach((quantity, card) => {
    const name = card.querySelector("h3").textContent;
    const price = Number(card.dataset.price);
    const itemTotal = price * quantity;
    itemCount += quantity;
    subtotal += itemTotal;

    const item = document.createElement("div");
    item.className = "cart-item";

    const description = document.createElement("div");
    description.className = "cart-item-description";
    const itemName = document.createElement("strong");
    itemName.textContent = name;
    const itemPrice = document.createElement("span");
    itemPrice.textContent = `${formatPrice(price)} each`;
    description.append(itemName, itemPrice);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.action = "decrease";
    decrease.dataset.item = name;
    decrease.setAttribute("aria-label", `Remove one ${name}`);
    decrease.textContent = "−";
    const quantityLabel = document.createElement("span");
    quantityLabel.textContent = String(quantity);
    quantityLabel.setAttribute("aria-label", `Quantity ${quantity}`);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.action = "increase";
    increase.dataset.item = name;
    increase.setAttribute("aria-label", `Add one ${name}`);
    increase.textContent = "+";
    controls.append(decrease, quantityLabel, increase);

    const total = document.createElement("strong");
    total.className = "cart-item-total";
    total.textContent = formatPrice(itemTotal);
    item.append(description, controls, total);
    cartItems.append(item);
  });

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your order is empty. Explore the menu to add a dish.";
    cartItems.append(empty);
  }

  cartCount.textContent = String(itemCount);
  cartTrigger.setAttribute("aria-label", `Open order, ${itemCount} item${itemCount === 1 ? "" : "s"}`);
  cartSubtotal.textContent = formatPrice(subtotal);
  checkoutSubmit.disabled = cart.size === 0;
};

renderCart();

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    let visibleCards = 0;

    categoryButtons.forEach((categoryButton) => {
      const isActive = categoryButton === button;
      categoryButton.classList.toggle("active", isActive);
      categoryButton.setAttribute("aria-pressed", String(isActive));
    });

    menuCards.forEach((card) => {
      const isVisible = category === "all" || card.dataset.category === category;
      card.hidden = !isVisible;
      if (isVisible) visibleCards += 1;
    });

    emptyMessage.hidden = visibleCards > 0;
  });
});

document.querySelector("#menu-grid").addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-to-cart");
  if (addButton) {
    const card = addButton.closest(".menu-card");
    cart.set(card, Math.min((cart.get(card) ?? 0) + 1, 20));
    resetWhatsAppLink();
    renderCart();
    orderStatus.textContent = `${card.querySelector("h3").textContent} added to your order.`;
    return;
  }

  const imageButton = event.target.closest(".card-image");
  if (!imageButton) return;

  const image = imageButton.querySelector("img");
  previewImage.src = image.src;
  previewImage.alt = image.alt;
  previewCaption.textContent = imageButton.closest(".menu-card").querySelector("h3").textContent;
  imageViewer.showModal();
});

closePreview.addEventListener("click", () => imageViewer.close());

imageViewer.addEventListener("click", (event) => {
  if (event.target === imageViewer) imageViewer.close();
});

cartTrigger.addEventListener("click", () => {
  if (!checkoutDialog.open) checkoutDialog.showModal();
});

document.querySelector("#checkout-close").addEventListener("click", () => checkoutDialog.close());

cartItems.addEventListener("click", (event) => {
  const control = event.target.closest("button[data-action]");
  if (!control) return;

  const card = Array.from(menuCards).find(
    (menuCard) => menuCard.querySelector("h3").textContent === control.dataset.item,
  );
  if (!card) return;

  const quantity = cart.get(card) ?? 0;
  if (control.dataset.action === "increase") {
    cart.set(card, Math.min(quantity + 1, 20));
  } else if (quantity <= 1) {
    cart.delete(card);
  } else {
    cart.set(card, quantity - 1);
  }

  resetWhatsAppLink();
  renderCart();
});

checkoutForm.addEventListener("input", resetWhatsAppLink);

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cart.size === 0) {
    orderStatus.textContent = "Add a menu item before sending your order.";
    checkoutDialog.close();
    return;
  }

  const formData = new FormData(checkoutForm);
  const orderLines = [...cart].map(([card, quantity]) => {
    const name = card.querySelector("h3").textContent;
    const price = Number(card.dataset.price);
    return `- ${name} x${quantity}: ${formatPrice(price * quantity)}`;
  });
  const subtotal = [...cart].reduce(
    (sum, [card, quantity]) => sum + Number(card.dataset.price) * quantity,
    0,
  );
  const message = [
    "Hello RoyalTaste, I would like to place a delivery order.",
    `Name: ${formData.get("customerName")}`,
    `Contact number: ${formData.get("customerPhone")}`,
    `Delivery area: ${formData.get("deliveryArea")}`,
    `Address / landmark: ${formData.get("deliveryAddress")}`,
    `Preferred Mobile Money network: ${formData.get("paymentNetwork")}`,
    "",
    "Order:",
    ...orderLines,
    `Estimated food subtotal: ${formatPrice(subtotal)}`,
    "",
    "Please confirm item availability, delivery fee, final total, and your official Mobile Money payment instructions. I understand no payment has been made on the website.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const smsUrl = `sms:+${whatsappNumber}?body=${encodeURIComponent(message)}`;
  whatsappSubmit.href = whatsappUrl;
  smsSubmit.href = smsUrl;
  smsSubmit.hidden = false;
  checkoutStatus.textContent = "Opening WhatsApp with your completed order. You can also send the order by SMS below.";

  const whatsappWindow = window.open(whatsappUrl, "_blank");
  if (whatsappWindow) {
    whatsappWindow.opener = null;
  } else {
    whatsappSubmit.hidden = false;
    checkoutSubmit.hidden = false;
    checkoutStatus.textContent =
      "Your browser blocked the WhatsApp window. Use the WhatsApp or SMS link below to send your completed order.";
  }
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("open", !isExpanded);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("open");
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();
