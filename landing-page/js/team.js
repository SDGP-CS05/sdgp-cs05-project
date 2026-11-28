/*
 * Team section: meet each person.
 *
 * What it does, in plain words:
 *   - Each name in the list is a button with a round face.
 *   - Hovering a name (or a person in the group photo) fades the other four
 *     out of the photo and pops up a small card with that person's photo,
 *     role and GitHub link. Move the mouse onto the card to click the link.
 *   - Clicking (or tapping, on a phone) pins the card open until you click
 *     the same name again, press Escape, use the close button or click
 *     anywhere else.
 *   - On wide screens the card floats over the photo, under the person.
 *     On phones it opens right under the name that was tapped.
 *
 * The names and roles stay readable without this file.
 */
;(function () {
  'use strict'

  var section = document.getElementById('team')
  var card = document.getElementById('member-card')
  if (!section || !card) return

  var frame = section.querySelector('.team__frame')
  var shades = Array.prototype.slice.call(section.querySelectorAll('.team__shade'))
  var buttons = Array.prototype.slice.call(section.querySelectorAll('.member'))
  var wide = window.matchMedia('(min-width: 1024px)')

  var face = card.querySelector('.member-card__face')
  var name = card.querySelector('.member-card__name')
  var role = card.querySelector('.member-card__role')
  var link = card.querySelector('.member-card__github')
  var handle = card.querySelector('.member-card__handle')
  var close = card.querySelector('.member-card__close')

  var HIDE_DELAY = 450 // ms: time to move the mouse from a name to the card

  var shown = null // button whose card is on screen
  var pinned = null // button whose card was clicked open
  var timer = 0

  function buttonFor(member) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-member') === member) return buttons[i]
    }
    return null
  }

  /* Fade everyone except `member` (or nobody, when null) and light up
     that person's row in the list. */
  function spotlight(member) {
    shades.forEach(function (shade) {
      shade.classList.toggle('is-chosen', shade.getAttribute('data-member') === member)
    })
    buttons.forEach(function (button) {
      button.classList.toggle('is-lit', button.getAttribute('data-member') === member)
    })
    if (frame) frame.classList.toggle('is-spotlit', member !== null)
  }

  /* Over the photo on wide screens, under the row on phones. */
  function place(button) {
    if (wide.matches && frame) {
      frame.appendChild(card)
      // Centre under the person, but keep the whole card inside the photo.
      var x = (parseFloat(button.getAttribute('data-x')) / 100) * frame.clientWidth
      var half = Math.min(340, frame.clientWidth - 32) / 2
      var edge = 16 + half
      card.style.left = Math.max(edge, Math.min(frame.clientWidth - edge, x)) + 'px'
    } else {
      button.parentNode.appendChild(card)
      card.style.left = ''
    }
  }

  /* Show this person's card and spotlight. */
  function show(button) {
    cancel()
    var github = button.getAttribute('data-github')
    if (shown !== button) {
      face.src = button.querySelector('.member__face').getAttribute('src')
      name.textContent = button.querySelector('.roster__name').textContent
      role.textContent = button.querySelector('.roster__role').textContent
      link.href = 'https://github.com/' + encodeURIComponent(github)
      handle.textContent = '@' + github
      card.setAttribute('aria-label', name.textContent)
      place(button)
    }
    spotlight(button.getAttribute('data-member'))
    card.hidden = false
    shown = button
  }

  function hide() {
    cancel()
    card.hidden = true
    shown = null
    spotlight(null)
  }

  /* After a hover ends: back to the pinned card, or nothing. Never pull the
     card away while the mouse or keyboard focus is on it. */
  function settle() {
    if (card.matches(':hover') || card.contains(document.activeElement)) return
    pinned ? show(pinned) : hide()
  }

  function later() {
    cancel()
    timer = window.setTimeout(settle, HIDE_DELAY)
  }

  function cancel() {
    if (timer) window.clearTimeout(timer)
    timer = 0
  }

  function pin(button) {
    pinned = button
    buttons.forEach(function (other) {
      other.setAttribute('aria-expanded', other === button ? 'true' : 'false')
    })
    show(button)
  }

  function unpin(returnFocus) {
    var last = pinned || shown
    pinned = null
    buttons.forEach(function (button) {
      button.setAttribute('aria-expanded', 'false')
    })
    hide()
    if (returnFocus && last) last.focus()
  }

  function toggle(button) {
    pinned === button ? unpin(false) : pin(button)
  }

  function isMouse(event) {
    return event.pointerType === 'mouse'
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      toggle(button)
    })
    // Hover preview (mouse only; a tap on a phone is a click).
    button.addEventListener('pointerenter', function (event) {
      if (isMouse(event)) show(button)
    })
    button.addEventListener('pointerleave', function (event) {
      if (isMouse(event)) later()
    })
    // Keyboard users get the same card while a name has focus.
    button.addEventListener('focus', function () {
      if (button.matches(':focus-visible')) show(button)
    })
    button.addEventListener('blur', later)
  })

  // The photo works the other way round: hover a person to see their card
  // and light up their name, click them to keep it open.
  shades.forEach(function (shade) {
    var button = buttonFor(shade.getAttribute('data-member'))
    if (!button) return
    shade.addEventListener('pointerenter', function (event) {
      if (isMouse(event)) show(button)
    })
    shade.addEventListener('pointerleave', function (event) {
      if (isMouse(event)) later()
    })
    shade.addEventListener('click', function () {
      toggle(button)
    })
  })

  // Keep the card up while the mouse is on it, so its link can be clicked.
  card.addEventListener('pointerenter', cancel)
  card.addEventListener('pointerleave', function (event) {
    if (isMouse(event)) later()
  })
  card.addEventListener('focusout', later)

  close.addEventListener('click', function () {
    unpin(true)
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && shown) unpin(true)
  })

  // A click outside the list, the photo and the card closes a pinned card.
  document.addEventListener('click', function (event) {
    if (!pinned) return
    if (card.contains(event.target)) return
    if (event.target.closest && event.target.closest('.member, .team__shade')) return
    unpin(false)
  })

  // Screen turned or resized across the breakpoint: move the card along.
  wide.addEventListener('change', function () {
    if (shown) place(shown)
  })
  window.addEventListener('resize', function () {
    if (shown && wide.matches) place(shown)
  })
})()
