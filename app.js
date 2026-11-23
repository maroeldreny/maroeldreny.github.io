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
})();
