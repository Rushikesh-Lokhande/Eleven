// Razorpay checkout integration (test mode)

(function (global) {
    function openPayment(orderData) {
      if (typeof Razorpay === "undefined") {
        alert("Razorpay script failed to load. Please check your network connection.");
        return;
      }
  
      var amountInPaise = (orderData.amount || 0) * 100;
      if (!amountInPaise) {
        alert("Invalid order amount.");
        return;
      }
  
      var options = {
        key: "rzp_test_1234567890", // Test key only; replace with live key in production
        amount: amountInPaise,
        currency: "INR",
        name: "Eleven Robotics",
        description: "System on Module Purchase",
        image: "assets/images/logo.svg",
        handler: function (response) {
          if (typeof orderData.onSuccess === "function") {
            orderData.onSuccess(response);
          }

          try {
            // Clear cart after successful test payment
            localStorage.removeItem("eleven_robotics_cart_v1");
          } catch (e) {
            console.warn("Unable to clear cart after payment", e);
          }

          window.location.href = "products.html";
        },
        modal: {
          ondismiss: function () {
            // If the user closes the popup or it fails to load, record it as a failure.
            if (typeof orderData.onFailure === "function") {
              orderData.onFailure({
                error: {
                  description: "Payment window was closed or failed to load (possible invalid Razorpay key)."
                }
              });
            }
          }
        },
        prefill: {
          name: orderData.name || "",
          email: orderData.email || "",
          contact: orderData.phone || ""
        },
        notes: {
          address: orderData.address || ""
        },
        theme: {
          color: "#3A7BFF"
        }
      };
  
      var rzp = new Razorpay(options);

      // Attach failure handler if provided
      rzp.on("payment.failed", function (response) {
        if (typeof orderData.onFailure === "function") {
          orderData.onFailure(response);
        }
      });

      rzp.open();
      return rzp;
    }
  
    global.RazorpayHandler = {
      openPayment: openPayment
    };
  })(window);