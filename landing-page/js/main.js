/*
 * GrowSync landing page behaviour. Plain JavaScript, no libraries.
 *
 *   1. Theme toggle          5. Menu sheet
 *   2. Scroll spy            6. Scroll reveal
 *   3. Dock magnification    7. Waitlist form
 *   4. Magnetic cursor       8. Loader clean-up, footer year
 *                            9. Explore the cabinet (hero drawing)
 *
 * The page is readable and navigable without this file. Everything
 * here is an addition on top of working HTML.
 */
;(function () {
  'use strict'

  var root = document.documentElement
  var config = window.GROWSYNC || {}
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

  function $(selector, scope) {
    return (scope || document).querySelector(selector)
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector))
  }

  /* ---------------------------------------------------------------
     1. Theme toggle
     The class on <html> is set before first paint by the inline
     script in index.html. This keeps the buttons and storage in step.
  ---------------------------------------------------------------- */
  function syncTheme() {
    var dark = root.classList.contains('dark')
    var label = dark ? 'Switch to light theme' : 'Switch to dark theme'
    $$('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-label', label)
    })
    $$('[data-theme-label]').forEach(function (node) {
      node.textContent = label
    })
    // Browser chrome follows the page colour token.
    var page = getComputedStyle(root).getPropertyValue('--page').trim()
    var meta = $('meta[name="theme-color"]')
    if (page && meta) meta.setAttribute('content', page)
  }

  $$('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var dark = root.classList.toggle('dark')
      try {
        localStorage.setItem('growsync-theme', dark ? 'dark' : 'light')
      } catch (error) {
        // Private mode: the choice simply lasts for this visit.
      }
      syncTheme()
    })
  })
  syncTheme()

  /* ---------------------------------------------------------------
     2. Scroll spy
     Marks the link for whichever section is crossing a thin band
     just above the middle of the viewport.
  ---------------------------------------------------------------- */
  var navLinks = $$('[data-nav]')

  function setActive(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute('data-nav') === id) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    ;['home', 'problem', 'features', 'how-it-works', 'team', 'waitlist'].forEach(function (id) {
      var section = document.getElementById(id)
      if (section) spy.observe(section)
    })
  }

  /* ---------------------------------------------------------------
     3. Dock magnification
     Each item grows as the pointer nears it, then eases back. Mouse
     only, and off entirely under reduced motion: the dock is then a
     plain row of links.
  ---------------------------------------------------------------- */
  ;(function dock() {
    var list = $('#dock')
    if (!list) return

    var BASE = 44 // resting size, px
    var MAX = 68 // size directly under the pointer, px
    var REACH = 130 // how far the pointer's influence extends, px
    var EASE = 0.22 // share of the remaining distance covered each frame

    var items = $$('.dock__item', list).map(function (element) {
      return { element: element, size: BASE, target: BASE }
    })
    var pointerX = null
    var frame = 0

    function step() {
      var moving = false
      // Read every position first, then write, to avoid layout thrash.
      var centres = items.map(function (item) {
        var rect = item.element.getBoundingClientRect()
        return rect.left + rect.width / 2
      })
      items.forEach(function (item, index) {
        var distance = pointerX === null ? Infinity : Math.abs(pointerX - centres[index])
        item.target = distance < REACH ? BASE + (MAX - BASE) * (1 - distance / REACH) : BASE
        item.size += (item.target - item.size) * EASE
        if (Math.abs(item.target - item.size) < 0.1) item.size = item.target
        else moving = true
        item.element.style.width = item.element.style.height = item.size + 'px'
      })
      frame = moving ? requestAnimationFrame(step) : 0
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(step)
    }

    list.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return
      pointerX = event.clientX
      wake()
    })
    list.addEventListener('pointerleave', function () {
      pointerX = null
      wake()
    })
  })()

  /* ---------------------------------------------------------------
     4. Magnetic cursor
     A soft dot trails the pointer and is drawn towards anything
     marked data-magnetic. Small targets (buttons, dock items) are
     wrapped by it; large ones (cards) only lean towards it, so it
     never covers a block of text. The native pointer stays visible.
     Off on touch devices and under reduced motion.
  ---------------------------------------------------------------- */
  ;(function magneticCursor() {
    var cursor = $('#cursor')
    if (!cursor) return

    var SIZE = 32 // resting diameter, px
    var FACTOR = 0.4 // share of the pointer's offset a target moves by
    var MAX_PULL = 12 // most any target is moved, px
    var PADDING = 6 // gap between a wrapped target and the cursor edge, px
    var WRAP_MAX = 180 // targets longer than this lean instead of being wrapped
    var FOLLOW = 0.18 // how quickly the cursor catches up, 0 to 1
    var RETURN = 0.14 // how quickly a released target settles back

    var enabled = false
    var visible = false
    var frame = 0
    var pointer = { x: -100, y: -100 }
    var position = { x: -100, y: -100 }
    var box = { width: SIZE, height: SIZE, radius: SIZE / 2 }
    var target = null
    // Every element the cursor has moved, with its current offset.
    var pulled = new Map()

    function offsetOf(element) {
      var state = pulled.get(element)
      if (!state) {
        state = { x: 0, y: 0, radius: parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0 }
        pulled.set(element, state)
      }
      return state
    }

    function tick() {
      var goalX = pointer.x
      var goalY = pointer.y
      var width = SIZE
      var height = SIZE
      var radius = SIZE / 2
      var wantX = 0
      var wantY = 0

      if (target) {
        var state = offsetOf(target)
        var rect = target.getBoundingClientRect()
        // Take the current pull back out to find where the element rests.
        var centreX = rect.left + rect.width / 2 - state.x
        var centreY = rect.top + rect.height / 2 - state.y
        var inside =
          pointer.x >= rect.left - PADDING &&
          pointer.x <= rect.right + PADDING &&
          pointer.y >= rect.top - PADDING &&
          pointer.y <= rect.bottom + PADDING

        if (!inside) {
          // The page scrolled the target away from a resting pointer.
          target = null
        } else {
          wantX = (pointer.x - centreX) * FACTOR
          wantY = (pointer.y - centreY) * FACTOR
          var length = Math.sqrt(wantX * wantX + wantY * wantY)
          if (length > MAX_PULL) {
            wantX = (wantX / length) * MAX_PULL
            wantY = (wantY / length) * MAX_PULL
          }

          if (Math.max(rect.width, rect.height) <= WRAP_MAX) {
            goalX = centreX + wantX
            goalY = centreY + wantY
            width = rect.width + PADDING * 2
            height = rect.height + PADDING * 2
            radius = Math.min(state.radius + PADDING, Math.min(width, height) / 2)
          } else {
            width = height = SIZE * 1.75
            radius = width / 2
          }
        }
      }

      // Move the active target towards its pull and let the rest settle home.
      pulled.forEach(function (state, element) {
        var active = element === target
        var toX = active ? wantX : 0
        var toY = active ? wantY : 0
        state.x += (toX - state.x) * (active ? 0.2 : RETURN)
        state.y += (toY - state.y) * (active ? 0.2 : RETURN)
        if (!active && Math.abs(state.x) < 0.05 && Math.abs(state.y) < 0.05) {
          element.style.transform = ''
          pulled.delete(element)
        } else {
          element.style.transform = 'translate(' + state.x.toFixed(2) + 'px,' + state.y.toFixed(2) + 'px)'
        }
      })

      position.x += (goalX - position.x) * FOLLOW
      position.y += (goalY - position.y) * FOLLOW
      box.width += (width - box.width) * FOLLOW
      box.height += (height - box.height) * FOLLOW
      box.radius += (radius - box.radius) * FOLLOW

      cursor.style.width = box.width.toFixed(1) + 'px'
      cursor.style.height = box.height.toFixed(1) + 'px'
      cursor.style.borderRadius = box.radius.toFixed(1) + 'px'
      cursor.style.transform =
        'translate(' + (position.x - box.width / 2).toFixed(1) + 'px,' + (position.y - box.height / 2).toFixed(1) + 'px)'

      frame = enabled && (visible || pulled.size) ? requestAnimationFrame(tick) : 0
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    function onMove(event) {
      if (event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      if (!visible) {
        visible = true
        position.x = pointer.x
        position.y = pointer.y
        cursor.classList.add('is-visible')
      }
      target = event.target instanceof Element ? event.target.closest('[data-magnetic]') : null
      wake()
    }

    function hide() {
      visible = false
      target = null
      cursor.classList.remove('is-visible')
      wake() // let any pulled element settle back
    }

    function update() {
      var next = finePointer.matches && !reducedMotion.matches
      if (next === enabled) return
      enabled = next
      root.classList.toggle('has-cursor', enabled)
      if (enabled) {
        window.addEventListener('pointermove', onMove, { passive: true })
        root.addEventListener('pointerleave', hide)
        window.addEventListener('blur', hide)
      } else {
        window.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerleave', hide)
        window.removeEventListener('blur', hide)
        visible = false
        target = null
        cursor.classList.remove('is-visible')
        pulled.forEach(function (state, element) {
          element.style.transform = ''
        })
        pulled.clear()
      }
    }

    finePointer.addEventListener('change', update)
    reducedMotion.addEventListener('change', update)
    update()
  })()

  /* ---------------------------------------------------------------
     5. Menu sheet
     A native <dialog>: the browser traps focus, closes on Escape and
     hands focus back to the button that opened it.
  ---------------------------------------------------------------- */
  ;(function menu() {
    var sheet = $('#menu')
    var open = $('#menu-open')
    var close = $('#menu-close')
    if (!sheet || !open || typeof sheet.showModal !== 'function') return

    open.addEventListener('click', function () {
      sheet.showModal()
    })
    close.addEventListener('click', function () {
      sheet.close()
    })
    // A click on the dimmed area lands on the dialog element itself.
    sheet.addEventListener('click', function (event) {
      if (event.target === sheet) sheet.close()
    })
    // Close first, then let the link jump to its section as normal.
    $$('a[href^="#"]', sheet).forEach(function (link) {
      link.addEventListener('click', function () {
        sheet.close()
      })
    })
  })()

  /* ---------------------------------------------------------------
     6. Scroll reveal
     Content fades up as it enters the viewport. The hiding style only
     applies once this class is set, so nothing is ever hidden when
     the script has not run.
  ---------------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('reveal-on')
    var revealer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    $$('.reveal').forEach(function (node) {
      revealer.observe(node)
    })
  }

  /* ---------------------------------------------------------------
     7. Waitlist form
     Validates in the browser, posts JSON to the configured endpoint
     and reports what actually happened. It never shows success unless
     the endpoint confirmed it accepted the details.
  ---------------------------------------------------------------- */
  ;(function waitlist() {
    var form = $('#waitlist-form')
    if (!form) return

    var fieldset = $('fieldset', form)
    var alertBox = $('#waitlist-alert')
    var success = $('#waitlist-success')
    var submit = $('#waitlist-submit')
    var submitLabel = $('#waitlist-submit-label')
    var spinner = $('.spinner', submit)
    var again = $('#waitlist-again')

    var endpoint = (config.waitlistEndpoint || '').trim()
    var email = config.contactEmail || 'themushroom26@gmail.com'
    var TIMEOUT_MS = 15000
    var sending = false

    var NOT_CONNECTED = 'The waitlist form is not connected yet, so nothing was sent. Please email ' + email + ' instead.'
    var SEND_FAILED =
      'We could not send your details, so you are not on the list yet. Check your connection and try again, or email ' +
      email +
      '.'

    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    // Sri Lankan numbers: 0XXXXXXXXX, or +94 / 94 followed by nine digits.
    var PHONE_PATTERN = /^(?:0\d{9}|(?:\+?94)\d{9})$/

    var fields = ['name', 'email', 'phone', 'district'].map(function (name) {
      var input = form.elements[name]
      return { name: name, input: input, error: $('#' + input.id + '-error'), hint: $('#' + input.id + '-hint') }
    })

    function check(name, value) {
      if (name === 'name') return value.trim().length < 2 ? 'Enter your name.' : ''
      if (name === 'email') {
        if (!value.trim()) return 'Enter your email address.'
        return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter an email address like name@example.com.'
      }
      if (name === 'phone') {
        var digits = value.replace(/[\s()-]/g, '')
        if (!digits) return 'Enter your phone number.'
        return PHONE_PATTERN.test(digits) ? '' : 'Enter a Sri Lankan number, like 071 234 5678 or +94 71 234 5678.'
      }
      return value ? '' : 'Choose your district.'
    }

    function showError(field, message) {
      var ids = []
      if (field.hint) ids.push(field.hint.id)
      if (message) {
        field.error.textContent = message
        field.error.hidden = false
        field.input.setAttribute('aria-invalid', 'true')
        ids.push(field.error.id)
      } else {
        field.error.hidden = true
        field.error.textContent = ''
        field.input.removeAttribute('aria-invalid')
      }
      if (ids.length) field.input.setAttribute('aria-describedby', ids.join(' '))
      else field.input.removeAttribute('aria-describedby')
    }

    function setSending(state) {
      sending = state
      submit.setAttribute('aria-disabled', String(state))
      spinner.hidden = !state
      submitLabel.textContent = state ? 'Sending' : 'Join the waitlist'
    }

    function showAlert(message) {
      alertBox.textContent = message
      alertBox.hidden = !message
    }

    /** Resolves only when the endpoint confirms it accepted the details. */
    function send(values) {
      if (!/^https:\/\//.test(endpoint)) return Promise.reject(new Error(NOT_CONNECTED))

      var controller = new AbortController()
      var timer = setTimeout(function () {
        controller.abort()
      }, TIMEOUT_MS)

      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          district: values.district,
          _subject: 'New GrowSync waitlist sign-up',
        }),
        signal: controller.signal,
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return null
            })
            .then(function (body) {
              var rejected = body && typeof body === 'object' && (body.ok === false || body.success === false)
              if (!response.ok || rejected) throw new Error(SEND_FAILED)
            })
        })
        .catch(function () {
          throw new Error(SEND_FAILED)
        })
        .finally(function () {
          clearTimeout(timer)
        })
    }

    // Clear a field's message as soon as the visitor starts fixing it.
    fields.forEach(function (field) {
      field.input.addEventListener('input', function () {
        if (field.input.hasAttribute('aria-invalid')) showError(field, '')
      })
    })

    form.addEventListener('submit', function (event) {
      event.preventDefault()
      if (sending) return

      var firstInvalid = null
      fields.forEach(function (field) {
        var message = check(field.name, field.input.value)
        showError(field, message)
        if (message && !firstInvalid) firstInvalid = field
      })
      if (firstInvalid) {
        showAlert('')
        firstInvalid.input.focus()
        return
      }

      var values = {}
      fields.forEach(function (field) {
        values[field.name] = field.input.value
      })

      showAlert('')
      setSending(true)
      send(values)
        .then(function () {
          form.reset()
          form.hidden = true
          success.hidden = false
          success.focus()
        })
        .catch(function (error) {
          showAlert(error.message)
        })
        .finally(function () {
          setSending(false)
        })
    })

    again.addEventListener('click', function () {
      success.hidden = true
      form.hidden = false
      fields[0].input.focus()
    })

    // The form ships disabled; switch it on now that it can be handled.
    fieldset.disabled = false
  })()

  /* ---------------------------------------------------------------
     8. Loader clean-up, footer year
     The loader hides itself with CSS. This only removes the node.
  ---------------------------------------------------------------- */
  var loader = $('.loader')
  if (loader) {
    setTimeout(function () {
      loader.remove()
    }, 1850)
  }

  var year = $('#year')
  if (year) year.textContent = String(new Date().getFullYear())

  /* ---------------------------------------------------------------
     9. Explore the cabinet
     Hovering a part of the hero drawing, or hovering, focusing or
     tapping one of its dots, lights that part up and shows a card
     with its name and what it does. A click or tap keeps the card
     open until the visitor clicks elsewhere or presses Escape.
  ---------------------------------------------------------------- */
  ;(function explore() {
    var figure = $('#explore')
    if (!figure) return

    var stage = $('.explore__stage', figure)
    var dots = $('.explore__dots', figure)
    var card = $('#part-card')
    var detail = $('.explore__detail', figure)
    var buttons = $$('.hotspot', figure)
    var groups = $$('.chamber [data-part]', figure)

    var GAP = 16 // space between a dot and the card, px
    var current = null
    var pinned = false
    var hideTimer = 0

    function buttonFor(id) {
      return buttons.filter(function (button) {
        return button.getAttribute('data-part') === id
      })[0]
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(value, max))
    }

    function fill(target, button) {
      $('.explore__name', target).textContent = button.getAttribute('aria-label')
      $('.explore__text', target).textContent = document.getElementById(button.getAttribute('aria-describedby')).textContent
    }

    // The card floats beside the dot when it fits there, so it never covers
    // the part it describes. Otherwise the details go in the caption below.
    function place(button) {
      fill(card, button)
      card.hidden = false
      card.style.visibility = 'hidden'

      var area = stage.getBoundingClientRect()
      var dot = button.getBoundingClientRect()
      var x = dot.left + dot.width / 2 - area.left
      var y = dot.top + dot.height / 2 - area.top
      var width = card.offsetWidth
      var height = card.offsetHeight
      var left = null

      if (x + GAP + width <= area.width) left = x + GAP
      else if (x - GAP - width >= 0) left = x - GAP - width

      if (left === null) {
        card.hidden = true
        fill(detail, button)
        detail.hidden = false
        figure.classList.add('is-detailing')
      } else {
        var top = clamp(y - height / 2, 0, area.height - height)
        card.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)'
        detail.hidden = true
        figure.classList.remove('is-detailing')
      }
      card.style.visibility = ''
    }

    function show(id) {
      clearTimeout(hideTimer)
      if (current === id) return
      var button = buttonFor(id)
      if (!button) return
      current = id

      figure.classList.add('is-exploring')
      groups.forEach(function (group) {
        group.classList.toggle('is-active', group.getAttribute('data-part') === id)
      })
      buttons.forEach(function (other) {
        other.classList.toggle('is-active', other === button)
      })

      place(button)
    }

    function hide() {
      clearTimeout(hideTimer)
      current = null
      pinned = false
      figure.classList.remove('is-exploring', 'is-detailing')
      groups.concat(buttons).forEach(function (node) {
        node.classList.remove('is-active')
      })
      card.hidden = true
      detail.hidden = true
    }

    // A short delay lets the pointer move from a part to its dot without flicker.
    function hideSoon() {
      if (pinned) return
      clearTimeout(hideTimer)
      hideTimer = setTimeout(hide, 120)
    }

    function pin(id) {
      if (current === id && pinned) {
        hide()
        return
      }
      show(id)
      pinned = true
    }

    buttons.forEach(function (button) {
      var id = button.getAttribute('data-part')
      button.addEventListener('pointerenter', function () {
        show(id)
      })
      button.addEventListener('pointerleave', hideSoon)
      button.addEventListener('focus', function () {
        show(id)
      })
      button.addEventListener('blur', hideSoon)
      button.addEventListener('click', function () {
        pin(id)
      })
    })

    groups.forEach(function (group) {
      var id = group.getAttribute('data-part')
      group.addEventListener('pointerenter', function () {
        show(id)
      })
      group.addEventListener('pointerleave', hideSoon)
      group.addEventListener('click', function () {
        pin(id)
      })
    })

    figure.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && current) hide()
    })

    document.addEventListener('pointerdown', function (event) {
      if (current && !figure.contains(event.target)) hide()
    })

    window.addEventListener('resize', function () {
      if (current) place(buttonFor(current))
    })

    // Everything is wired up: show the dots and the hint.
    dots.hidden = false
    figure.classList.add('is-interactive')
  })()
})()
