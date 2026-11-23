// Maro Eldreny static site — countdown + order form
(function () {
    'use strict';

    var WA_MAIN = 'https://wa.me/201038087724';

    function waLink(msg) {
        return WA_MAIN + '?text=' + encodeURIComponent(msg);
    }

    // Black Friday countdown
    var target = new Date('2026-11-27T00:00:00+02:00').getTime();
    var countEl = document.getElementById('maro-count');
    if (countEl) {
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var tick = function () {
            var diff = Math.max(0, target - Date.now());
            if (diff === 0) {
                countEl.outerHTML = '<div class="maro-count-live">العروض شغالة دلوقتي — كلمنا على واتساب قبل ما تخلص!</div>';
                clearInterval(timer);
                return;
            }
            var days = Math.floor(diff / 86400000);
            var hours = Math.floor((diff % 86400000) / 3600000);
            var mins = Math.floor((diff % 3600000) / 60000);
            var secs = Math.floor((diff % 60000) / 1000);
            var nums = countEl.querySelectorAll('.maro-count-num');
            if (nums.length === 4) {
                nums[0].textContent = pad(days);
                nums[1].textContent = pad(hours);
                nums[2].textContent = pad(mins);
                nums[3].textContent = pad(secs);
            }
        };
        var timer = setInterval(tick, 1000);
        tick();
    }

    // Order form
    var form = document.getElementById('maro-order-form');
    if (form) {
        var nameInput = document.getElementById('maro-f-name');
        var qtyInput = document.getElementById('maro-f-qty');
        var notesInput = document.getElementById('maro-f-notes');
        var sendBtn = document.getElementById('maro-f-send');
        var choices = form.querySelectorAll('.maro-choice');
        var service = choices.length ? choices[0].getAttribute('data-value') : '';

        choices.forEach(function (chip) {
            chip.addEventListener('click', function () {
                choices.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
                chip.setAttribute('aria-pressed', 'true');
                service = chip.getAttribute('data-value');
                update();
            });
        });

        function update() {
            var lines = [
                'أهلًا مطابع مارو الدريني 👋',
                'أنا: ' + (nameInput.value.trim() || '...'),
                'الخدمة المطلوبة: ' + service,
                'الكمية: ' + (qtyInput.value.trim() || '...'),
            ];
            var notes = notesInput.value.trim();
            if (notes) lines.push('تفاصيل إضافية: ' + notes);
            lines.push('هبعت ملف التصميم هنا في الشات. مستني السعر ومعاد التسليم.');
            sendBtn.setAttribute('href', waLink(lines.join('\n')));
        }

        [nameInput, qtyInput, notesInput].forEach(function (el) {
            el.addEventListener('input', update);
        });
        update();
    }

    // ===== Animations: page transitions + scroll reveal =====
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var shell = document.querySelector('.maro-shell');

    // Smooth transition between pages when tapping the bottom tab bar.
    // Internal pages only — wa.me / tel: links are left untouched.
    if (shell && !reducedMotion) {
        document.querySelectorAll('.maro-tabbar a.maro-tab').forEach(function (tab) {
            var href = tab.getAttribute('href') || '';
            if (!/\.html($|[?#])/.test(href)) return;
            tab.addEventListener('click', function (e) {
                if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (tab.getAttribute('aria-current') === 'page') { e.preventDefault(); return; }
                e.preventDefault();
                shell.classList.add('maro-page-exit');
                setTimeout(function () { window.location.href = href; }, 180);
            });
        });
        // If the browser restores this page from the back/forward cache,
        // undo the exit state so the page is visible again.
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) shell.classList.remove('maro-page-exit');
        });
    }

    // Scroll-reveal: cards, offers, steps, reviews and section titles
    // fade/rise in as they enter the viewport, with a light stagger.
    if (!reducedMotion && 'IntersectionObserver' in window) {
        var revealSelectors = [
            '.file-group-label',
            '.file-group-heading',
            '.maro-bf',
            '.maro-offer',
            '.maro-service',
            '.maro-heritage',
            '.maro-steps',
            '.maro-step',
            '.maro-rating-summary',
            '.maro-review',
            '.maro-partners',
            '.maro-branch',
            '.maro-form',
            '.maro-contact',
            '.file-callout',
            '.file-caption',
            '.file-closing'
        ];
        var revealEls = [];
        revealSelectors.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                // the first section's main title already has its own entrance animation
                if (el.matches('.file-group:first-of-type .file-group-heading')) return;
                if (revealEls.indexOf(el) === -1) revealEls.push(el);
            });
        });
        if (revealEls.length) {
            document.documentElement.classList.add('maro-anim');
            revealEls.forEach(function (el) { el.setAttribute('data-maro-reveal', ''); });
            var observer = new IntersectionObserver(function (entries) {
                var batch = entries.filter(function (en) { return en.isIntersecting; });
                if (!batch.length) return;
                batch.sort(function (a, b) {
                    var ra = a.target.getBoundingClientRect();
                    var rb = b.target.getBoundingClientRect();
                    return (ra.top - rb.top) || (ra.left - rb.left);
                });
                batch.forEach(function (entry, i) {
                    entry.target.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
                    entry.target.classList.add('maro-revealed');
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
            revealEls.forEach(function (el) { observer.observe(el); });
        }
    }
})();
