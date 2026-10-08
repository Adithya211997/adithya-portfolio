// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      drawer.classList.toggle('open');
      toggle.textContent = drawer.classList.contains('open') ? '[ CLOSE ]' : '[ MENU ]';
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content permanently invisible (sticky elements,
    // fast scrolls, or edge cases can prevent an intersection from firing).
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Live coordinate / clock ticker in hero kicker (purely decorative)
  var ticker = document.querySelector('[data-ticker]');
  if (ticker) {
    function pad(n) { return n < 10 ? '0' + n : n; }
    function update() {
      var d = new Date();
      ticker.textContent = 'LOCAL TIME ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    update();
    setInterval(update, 1000);
  }

  // Contact form -> mailto fallback (no backend)
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value;
      var email = form.querySelector('[name="email"]').value;
      var message = form.querySelector('[name="message"]').value;
      var subject = encodeURIComponent('Project enquiry from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:adithyaprasanna3@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
});
