(function () {
  function setMessage(element, message, tone) {
    element.textContent = message;
    element.dataset.tone = tone;
  }

  function applySettings(root, settings) {
    if (!settings || !settings.isEnabled) {
      root.hidden = true;
      return;
    }

    var labelMap = {
      fullName: settings.fullNameLabel,
      phone: settings.phoneLabel,
      city: settings.cityLabel,
      address: settings.addressLabel,
      quantity: settings.quantityLabel
    };

    Object.keys(labelMap).forEach(function (key) {
      var label = root.querySelector('[data-label="' + key + '"]');
      if (label && labelMap[key]) label.textContent = labelMap[key];
    });

    var button = root.querySelector("[data-express-form-cod-button]");
    if (button && settings.buttonText) button.textContent = settings.buttonText;
    root.dataset.successMessage = settings.successMessage || "Thank you. We received your order.";
  }

  function initForm(root) {
    var appUrl = (root.dataset.appUrl || "").replace(/\/$/, "");
    var form = root.querySelector("[data-express-form-cod-form]");
    var button = root.querySelector("[data-express-form-cod-button]");
    var message = root.querySelector("[data-express-form-cod-message]");

    if (!appUrl || !form || !button || !message) {
      root.hidden = true;
      return;
    }

    fetch(appUrl + "/api/cod?shop=" + encodeURIComponent(root.dataset.shop || ""))
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        applySettings(root, data.settings);
      })
      .catch(function () {
        root.hidden = true;
      });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var formData = new FormData(form);
      var payload = {
        shop: root.dataset.shop,
        productId: root.dataset.productId,
        variantId: root.dataset.variantId,
        productTitle: root.dataset.productTitle,
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        address: formData.get("address"),
        quantity: Number(formData.get("quantity") || 1)
      };

      button.disabled = true;
      setMessage(message, "", "");

      fetch(appUrl + "/api/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) throw data;
            return data;
          });
        })
        .then(function () {
          form.reset();
          setMessage(message, root.dataset.successMessage, "success");
        })
        .catch(function (error) {
          var fallback = "Please check your information and try again.";
          var details = error && error.errors ? Object.values(error.errors)[0] : error && error.error;
          setMessage(message, details || fallback, "critical");
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }

  document.querySelectorAll("[data-express-form-cod]").forEach(initForm);
})();
