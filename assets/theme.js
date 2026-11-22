/* Odd Ritual — template-only behaviour.
 *
 * Every interaction on the reference pages (preloader, menu, sliders, draggable
 * product marquee, hover images, cursor, easter egg, signup popup, nav colour,
 * page transitions) comes from the original assets/scripts-2026.js, and the cart
 * drawer from the vendored Udesly bridge. This file adds only the variant picker
 * for the product template, which the reference build did not include.
 */
(function () {
  'use strict';

  function init() {
    var form = document.querySelector('.product-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';

    var dataEl = document.querySelector('[data-product-variants]');
    if (!dataEl) return;

    var variants = JSON.parse(dataEl.textContent);
    var idInput = form.querySelector('[data-variant-id]');
    var priceEl = document.querySelector('[data-product-price]');
    var button = form.querySelector('[data-add-to-cart]');
    var buttonText = form.querySelector('[data-add-to-cart-text]');
    var strings = (window.Theme && window.Theme.strings) || {};

    function money(cents) {
      var fmt = (window.Theme && window.Theme.moneyFormat) || '${{amount}}';
      var value = (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return fmt.replace(/\{\{\s*amount[^}]*\}\}/, value);
    }

    function chosen() {
      var values = [];
      form.querySelectorAll('input[data-option-index]:checked').forEach(function (input) {
        values[parseInt(input.getAttribute('data-option-index'), 10) - 1] = input.value;
      });
      return values;
    }

    function update() {
      var picked = chosen();
      var variant = variants.filter(function (v) {
        return picked.every(function (value, i) { return v.options[i] === value; });
      })[0];

      if (!variant) {
        if (button) button.disabled = true;
        if (buttonText) buttonText.textContent = strings.unavailable || 'Unavailable';
        return;
      }
      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = money(variant.price);
      if (button) button.disabled = !variant.available;
      if (buttonText) {
        buttonText.textContent = variant.available
          ? (strings.addToCart || 'Add to cart')
          : (strings.soldOut || 'Sold out');
      }
    }

    form.querySelectorAll('input[data-option-index]').forEach(function (input) {
      input.addEventListener('change', update);
    });
    update();
  }

  // Collection toolbar. Delegated on document so it survives Barba swapping
  // the page container, which a per-element bind at init would not.
  document.addEventListener('change', function (e) {
    var sel = e.target && e.target.closest ? e.target.closest('[data-sort-select]') : null;
    if (!sel) return;
    var url = new URL(window.location.href);
    url.searchParams.set('sort_by', sel.value);
    url.searchParams.delete('page');
    window.location.assign(url.toString());
  });
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-filters-open]') : null;
    if (!btn) return;
    var rail = document.getElementById('CollectionFilters');
    if (!rail) return;
    var open = rail.getAttribute('data-open') === 'true';
    rail.setAttribute('data-open', open ? 'false' : 'true');
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
