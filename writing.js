(function () {
  var search = document.getElementById('writing-search');
  var chipBox = document.getElementById('filter-chips');
  var list = document.getElementById('writing-list');
  var countEl = document.getElementById('writing-count');
  var emptyEl = document.getElementById('writing-empty');
  var clearBtn = document.getElementById('clear-filters');
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.writing-item'));
  var total = items.length;
  var activeType = 'all';

  function apply() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var shown = 0;
    items.forEach(function (item) {
      var typeOk = activeType === 'all' || item.dataset.type === activeType;
      var textOk = q === '' || (item.dataset.text || '').indexOf(q) !== -1;
      var visible = typeOk && textOk;
      item.classList.toggle('is-hidden', !visible);
      if (visible) shown++;
    });

    if (countEl) {
      if (q === '' && activeType === 'all') {
        countEl.textContent = total + (total === 1 ? ' item' : ' items');
      } else {
        countEl.textContent =
          shown + (shown === 1 ? ' match' : ' matches') + ' of ' + total;
      }
    }
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  function setType(type) {
    activeType = type;
    if (chipBox) {
      chipBox.querySelectorAll('.chip').forEach(function (chip) {
        var on = chip.dataset.type === type;
        chip.classList.toggle('active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    apply();
  }

  if (search) search.addEventListener('input', apply);

  if (chipBox) {
    chipBox.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) setType(chip.dataset.type);
    });
  }

  // Clicking a tag searches for it across all types.
  list.addEventListener('click', function (e) {
    var tag = e.target.closest('.tag');
    if (!tag) return;
    if (search) search.value = tag.dataset.tag;
    setType('all');
    if (search) search.focus();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (search) search.value = '';
      setType('all');
      if (search) search.focus();
    });
  }

  setType('all');
})();
