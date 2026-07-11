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

    // Cache transparency results per src so repeat opens don't re-sample.
    var transparencyCache = {};

    // Draw the (already-decoded) thumbnail to a small canvas and scan its
    // alpha channel. Same-origin images only, so the canvas won't taint.
    // Returns true if any pixel is meaningfully transparent.
    function hasTransparency(img) {
        var key = img.currentSrc || img.src;
        if (key in transparencyCache) return transparencyCache[key];

        var result = true; // safe default: back it if we can't tell
        try {
            var w = img.naturalWidth || img.width;
            var h = img.naturalHeight || img.height;
            if (w && h) {
                var scale = Math.min(1, 512 / Math.max(w, h));
                var cw = Math.max(1, Math.round(w * scale));
                var ch = Math.max(1, Math.round(h * scale));
                var canvas = document.createElement('canvas');
                canvas.width = cw;
                canvas.height = ch;
                var ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, cw, ch);
                var data = ctx.getImageData(0, 0, cw, ch).data;
                result = false;
                for (var i = 3; i < data.length; i += 4) {
                    if (data[i] < 250) { result = true; break; }
                }
            }
        } catch (e) {
            result = true;
        }

        transparencyCache[key] = result;
        return result;
    }

    function open(img) {
        fullImg.src = img.currentSrc || img.src;
        fullImg.alt = img.alt || '';
        fullImg.classList.toggle('has-transparency', hasTransparency(img));
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
