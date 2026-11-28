/*
 * Soft glow that follows the mouse across the feature cards.
 * Only sets two CSS variables (--mx, --my); the look is in extras.css.
 */
;(function () {
  'use strict'

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  Array.prototype.forEach.call(document.querySelectorAll('.feature__card'), function (card) {
    card.classList.add('glow')
    card.addEventListener(
      'pointermove',
      function (event) {
        var box = card.getBoundingClientRect()
        card.style.setProperty('--mx', event.clientX - box.left + 'px')
        card.style.setProperty('--my', event.clientY - box.top + 'px')
      },
      { passive: true }
    )
  })
})()
