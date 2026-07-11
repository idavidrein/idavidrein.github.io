(function () {
    var images = document.querySelectorAll('.post-body img');
    if (!images.length) return;

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image preview');
    var fullImg = document.createElement('img');
    fullImg.alt = '';
    dialog.appendChild(fullImg);
    document.body.appendChild(dialog);

    function open(img) {
        fullImg.src = img.currentSrc || img.src;
        fullImg.alt = img.alt || '';
        // build.py tags images with real transparency; only those get a solid
        // backing so their see-through areas don't read against the backdrop.
        fullImg.classList.toggle('has-transparency', img.dataset.transparent === 'true');
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    dialog.addEventListener('click', function (e) {
        if (e.target === dialog || e.target === fullImg) dialog.close();
    });

    images.forEach(function (img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function () {
            open(img);
        });
    });
})();
