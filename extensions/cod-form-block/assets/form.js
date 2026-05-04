document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('express-cod-form');
    if (!form) return;

    const btn = document.getElementById('express-cod-submit');
    const loader = btn.querySelector('.loader');
    const btnText = btn.querySelector('.btn-text');
    const successMsg = document.getElementById('express-cod-success');
    const errorMsg = document.getElementById('express-cod-error');

    const block = document.querySelector('.express-cod-block');
    const shop = block.getAttribute('data-shop');
    const variantId = block.getAttribute('data-variant-id');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Reset messages
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';

        // UI Loading state
        btn.disabled = true;
        loader.style.display = 'block';
        btnText.style.display = 'none';

        const formData = new FormData(form);
        const data = {
            shop: shop,
            variantId: variantId,
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            address: formData.get('address'),
            quantity: formData.get('quantity'),
            productId: formData.get('productId')
        };

        try {
            // The API proxy endpoint must be configured in shopify.app.toml
            const response = await fetch('/apps/express-cod/api/cod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                successMsg.style.display = 'block';
                form.reset();
            } else {
                throw new Error(result.error || 'Failed to place order');
            }
        } catch (err) {
            console.error('COD Form Error:', err);
            errorMsg.style.display = 'block';
            errorMsg.textContent = err.message || 'Failed to place order. Please try again.';
        } finally {
            // Restore UI
            btn.disabled = false;
            loader.style.display = 'none';
            btnText.style.display = 'block';
        }
    });
});
