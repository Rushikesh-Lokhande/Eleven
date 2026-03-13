// Cart management with localStorage

(function (global) {
    var STORAGE_KEY = "eleven_robotics_cart_v1";
    var MAX_QTY = 10;
    var MIN_QTY = 1;
  
    function readCart() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch (e) {
        console.warn("Failed to read cart from storage", e);
        return [];
      }
    }
  
    function writeCart(items) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Failed to write cart to storage", e);
      }
    }
  
    function clampQuantity(qty) {
      if (isNaN(qty) || qty < MIN_QTY) return MIN_QTY;
      if (qty > MAX_QTY) return MAX_QTY;
      return qty;
    }
  
    function getProductById(id) {
      if (global.ProductCatalog && Array.isArray(global.ProductCatalog.products)) {
        return global.ProductCatalog.getProductById(id);
      }
      if (global.products) {
        return global.products.find(function (p) {
          return p.id === id;
        }) || null;
      }
      return null;
    }
  
    function addToCart(productId, qty) {
      var product = getProductById(productId);
      if (!product) {
        alert("Product not found.");
        return;
      }
      var quantity = clampQuantity(qty || 1);
      var cart = readCart();
      var existing = cart.find(function (item) {
        return item.id === productId;
      });
      if (existing) {
        existing.qty = clampQuantity(existing.qty + quantity);
      } else {
        cart.push({
          id: productId,
          qty: quantity
        });
      }
      writeCart(cart);
      updateCartBadge();
    }
  
    function removeFromCart(productId) {
      var cart = readCart().filter(function (item) {
        return item.id !== productId;
      });
      writeCart(cart);
      updateCartBadge();
    }
  
    function updateQuantity(productId, qty) {
      var quantity = clampQuantity(qty);
      var cart = readCart();
      var item = cart.find(function (i) {
        return i.id === productId;
      });
      if (!item) return;
      item.qty = quantity;
      writeCart(cart);
      updateCartBadge();
    }
  
    function getCartWithDetails() {
      var cart = readCart();
      return cart.map(function (item) {
        var product = getProductById(item.id);
        if (!product) return null;
        return {
          id: item.id,
          qty: clampQuantity(item.qty || 1),
          product: product
        };
      }).filter(Boolean);
    }
  
    function getCartTotals() {
      var detailed = getCartWithDetails();
      var itemsCount = 0;
      var total = 0;
      detailed.forEach(function (entry) {
        itemsCount += entry.qty;
        total += entry.qty * entry.product.price;
      });
      return {
        items: itemsCount,
        total: total
      };
    }
  
    function updateCartBadge() {
      var badge = document.getElementById("cart-count");
      if (!badge) return;
      var totals = getCartTotals();
      badge.textContent = totals.items || 0;
    }
  
    function bindAddToCartButtons() {
      var buttons = document.querySelectorAll("[data-add-to-cart][data-product-id]");
      if (!buttons.length) return;
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-product-id");
          addToCart(id, 1);
        });
      });
    }
  
    // Quantity controls for product detail pages
    function bindQuantityButtons(input) {
      if (!input) return;
      var wrapper = input.parentElement;
      if (!wrapper) return;
      var minusBtn = wrapper.querySelector("[data-qty-decrease]");
      var plusBtn = wrapper.querySelector("[data-qty-increase]");
  
      if (minusBtn) {
        minusBtn.addEventListener("click", function () {
          var current = parseInt(input.value, 10) || 1;
          input.value = clampQuantity(current - 1);
        });
      }
      if (plusBtn) {
        plusBtn.addEventListener("click", function () {
          var current = parseInt(input.value, 10) || 1;
          input.value = clampQuantity(current + 1);
        });
      }
    }
  
    // Render cart page table
    function renderCartPage() {
      var loadingEl = document.getElementById("cart-loading");
      var emptyEl = document.getElementById("cart-empty");
      var tableWrapper = document.getElementById("cart-table-wrapper");
      var summaryEl = document.getElementById("cart-summary");
      var tbody = document.getElementById("cart-items-body");
  
      if (!tbody) return;
  
      loadingEl && (loadingEl.style.display = "block");
      emptyEl && (emptyEl.hidden = true);
      tableWrapper && (tableWrapper.hidden = true);
      summaryEl && (summaryEl.hidden = true);
  
      var detailed = getCartWithDetails();
  
      loadingEl && (loadingEl.style.display = "none");
  
      if (!detailed.length) {
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
  
      tbody.innerHTML = "";
      detailed.forEach(function (entry) {
        var tr = document.createElement("tr");
        var subtotal = entry.qty * entry.product.price;
  
        tr.innerHTML = `
          <td>
            <div class="cart-product">
              <img src="${entry.product.image}" alt="${entry.product.name}">
              <div>
                <div class="cart-product-name">${entry.product.name}</div>
                <div class="cart-product-meta">ID: ${entry.product.id}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="cart-qty-input">
              <button type="button" data-cart-qty-decrease aria-label="Decrease quantity">-</button>
              <input type="number" min="${MIN_QTY}" max="${MAX_QTY}" value="${entry.qty}">
              <button type="button" data-cart-qty-increase aria-label="Increase quantity">+</button>
            </div>
          </td>
          <td>₹${entry.product.price.toLocaleString("en-IN")}</td>
          <td data-cart-subtotal>₹${subtotal.toLocaleString("en-IN")}</td>
          <td>
            <button type="button" class="cart-remove-btn" data-cart-remove>Remove</button>
          </td>
        `;
  
        // Attach events
        var qtyInput = tr.querySelector("input[type='number']");
        var decBtn = tr.querySelector("[data-cart-qty-decrease]");
        var incBtn = tr.querySelector("[data-cart-qty-increase]");
        var removeBtn = tr.querySelector("[data-cart-remove]");
        var subtotalCell = tr.querySelector("[data-cart-subtotal]");
  
        function updateEntryQuantity(newQty) {
          var clamped = clampQuantity(newQty);
          qtyInput.value = clamped;
          updateQuantity(entry.id, clamped);
          var st = clamped * entry.product.price;
          subtotalCell.textContent = "₹" + st.toLocaleString("en-IN");
          updateSummary();
        }
  
        if (qtyInput) {
          qtyInput.addEventListener("change", function () {
            updateEntryQuantity(parseInt(qtyInput.value, 10) || 1);
          });
        }
        if (decBtn) {
          decBtn.addEventListener("click", function () {
            var current = parseInt(qtyInput.value, 10) || 1;
            updateEntryQuantity(current - 1);
          });
        }
        if (incBtn) {
          incBtn.addEventListener("click", function () {
            var current = parseInt(qtyInput.value, 10) || 1;
            updateEntryQuantity(current + 1);
          });
        }
        if (removeBtn) {
          removeBtn.addEventListener("click", function () {
            removeFromCart(entry.id);
            tr.remove();
            var remaining = getCartWithDetails();
            if (!remaining.length) {
              var tableWrapperEl = document.getElementById("cart-table-wrapper");
              var emptyEl2 = document.getElementById("cart-empty");
              var summaryEl2 = document.getElementById("cart-summary");
              if (tableWrapperEl) tableWrapperEl.hidden = true;
              if (summaryEl2) summaryEl2.hidden = true;
              if (emptyEl2) emptyEl2.hidden = false;
            } else {
              updateSummary();
            }
          });
        }
  
        tbody.appendChild(tr);
      });
  
      if (tableWrapper) tableWrapper.hidden = false;
      if (summaryEl) summaryEl.hidden = false;
      updateSummary();
    }
  
    function updateSummary() {
      var totals = getCartTotals();
      var itemsCountEl = document.getElementById("cart-items-count");
      var subtotalEl = document.getElementById("cart-subtotal");
      var totalEl = document.getElementById("cart-total");
  
      if (itemsCountEl) itemsCountEl.textContent = totals.items.toString();
      if (subtotalEl) subtotalEl.textContent = "₹" + totals.total.toLocaleString("en-IN");
      if (totalEl) totalEl.textContent = "₹" + totals.total.toLocaleString("en-IN");
    }
  
    function getTotalAmount() {
      return getCartTotals().total;
    }
  
    // Public API
    var api = {
      addToCart: addToCart,
      removeFromCart: removeFromCart,
      updateQuantity: updateQuantity,
      getCartWithDetails: getCartWithDetails,
      getCartTotals: getCartTotals,
      getTotalAmount: getTotalAmount,
      updateCartBadge: updateCartBadge,
      bindAddToCartButtons: bindAddToCartButtons,
      renderCartPage: renderCartPage,
      bindQuantityButtons: bindQuantityButtons,
      clampQuantity: clampQuantity,
      getProductById: getProductById
    };
  
    global.Cart = api;
  
    document.addEventListener("DOMContentLoaded", function () {
      updateCartBadge();
  
      // If this is the cart page, render contents and bind checkout
      var cartRoot = document.getElementById("cart-root");
      if (cartRoot) {
        renderCartPage();
  
        var checkoutBtn = document.getElementById("cart-checkout-btn");
        var checkoutSection = document.getElementById("checkout-section");
        var checkoutForm = document.getElementById("checkout-form");

        // Auto-open checkout when coming from "Buy Now"
        try {
          var params = new URLSearchParams(window.location.search || "");
          var shouldOpenCheckout = params.get("checkout") === "1" || window.location.hash === "#checkout";
          if (shouldOpenCheckout && checkoutSection) {
            checkoutSection.hidden = false;
            setTimeout(function () {
              checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
  
        if (checkoutBtn && checkoutSection && checkoutForm) {
          checkoutBtn.addEventListener("click", function () {
            checkoutSection.hidden = false;
            checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
          });
  
          function buildCartItemsSummary() {
            var items = getCartWithDetails();
            return items
              .map(function (entry) {
                return entry.qty + "× " + entry.product.name + " (₹" + entry.product.price.toLocaleString("en-IN") + ")";
              })
              .join(" | ");
          }
  
          function submitCheckoutFormToNetlify(status, paymentId, errorMessage) {
            var name = document.getElementById("checkout-name").value.trim();
            var email = document.getElementById("checkout-email").value.trim();
            var phone = document.getElementById("checkout-phone").value.trim();
            var address = document.getElementById("checkout-address").value.trim();

            const templateParams = {
              from_name: name,
              from_email: email,
              phone: phone,
              address: address,
              items: buildCartItemsSummary(),
              total_amount: getTotalAmount().toString(),
              status: status,
              payment_id: paymentId || "",
              error_message: errorMessage || ""
            };

            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
              .then(function(response) {
                console.log('Checkout email sent successfully');
              }, function(error) {
                console.warn('Failed to send checkout email', error);
              });
          }
  
          checkoutForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!global.RazorpayHandler || typeof global.RazorpayHandler.openPayment !== "function") {
              var msg = "Razorpay is not available. Please ensure you are online and the Razorpay script is loaded.";
              alert(msg);
              submitCheckoutFormToNetlify("failure", "", msg);
              return;
            }
            var name = document.getElementById("checkout-name").value.trim();
            var email = document.getElementById("checkout-email").value.trim();
            var phone = document.getElementById("checkout-phone").value.trim();
            var address = document.getElementById("checkout-address").value.trim();
            if (!name || !email || !phone || !address) {
              alert("Please fill all required fields.");
              return;
            }
  
            var amount = getTotalAmount();
            if (!amount) {
              alert("Your cart is empty.");
              return;
            }
  
            // Send a Netlify form submission so we get an email record of the checkout attempt.
            submitCheckoutFormToNetlify("initiated", "", "");
  
            global.RazorpayHandler.openPayment({
              name: name,
              email: email,
              phone: phone,
              address: address,
              amount: amount,
              onSuccess: function (response) {
                submitCheckoutFormToNetlify("success", response.razorpay_payment_id, "");
              },
              onFailure: function (response) {
                var err = "Payment failed";
                if (response && response.error) {
                  var e = response.error;
                  var code = e.code || e.reason || e.step || "";
                  var desc = e.description || e.reason || "";
                  var meta = e.metadata ? JSON.stringify(e.metadata) : "";
                  err = [code, desc, meta].filter(Boolean).join(" | ") || err;
                }
                submitCheckoutFormToNetlify("failure", "", err);
              }
            });
          });
        }
      }
    });
  })(window);