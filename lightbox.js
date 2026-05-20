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

    function open(src, alt) {
        fullImg.src = src;
        fullImg.alt = alt || '';
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
            open(img.currentSrc || img.src, img.alt);
        });
    });
})();
