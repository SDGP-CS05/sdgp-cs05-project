/*
 * Spore + mycelium background for the hero.
 *
 * What it does, in plain words:
 *   - Draws slow-drifting spores (small dots) on a <canvas> behind the hero.
 *   - Spores that are close to each other get a thin curved thread between
 *     them, like mycelium. Spores near the mouse reach toward the cursor.
 *   - Colours come from the page's CSS variables, so it follows the palette
 *     and the light/dark theme. No colour is written in this file.
 *   - Pauses when the hero is off screen or the tab is hidden.
 *   - With "reduce motion" on, it draws one still frame and does not animate.
 *
 * The page works fine without this file. It is only an addition.
 */
;(function () {
  'use strict'

  var hero = document.getElementById('home')
  if (!hero) return

  var root = document.documentElement
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

  var canvas = document.createElement('canvas')
  canvas.className = 'spores'
  canvas.setAttribute('aria-hidden', 'true')
  hero.insertBefore(canvas, hero.firstChild)

  var ctx = canvas.getContext('2d')
  if (!ctx) return

  var width = 0
  var height = 0
  var spores = []
  var mouse = { x: -9999, y: -9999, on: false }
  var colors = { spore: '#76543f', thread: '#b58d72' }
  var frame = 0
  var onScreen = true

  var THREAD_DIST = 110 // spore to spore
  var MOUSE_DIST = 170 // spore to cursor

  /* Read the palette from CSS variables (changes with the theme). */
  function readColors() {
    var styles = getComputedStyle(root)
    var dark = root.classList.contains('dark')
    colors.spore = styles.getPropertyValue(dark ? '--sand' : '--walnut').trim() || colors.spore
    colors.thread = styles.getPropertyValue('--taupe').trim() || colors.thread
  }

  function makeSpore() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.04 - Math.random() * 0.16, // drifts upward
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.4,
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Fewer spores on small screens and touch phones (saves battery).
    var max = finePointer.matches && width > 700 ? 70 : 26
    var count = Math.max(18, Math.min(max, Math.round((width * height) / 20000)))
    spores = []
    for (var i = 0; i < count; i++) spores.push(makeSpore())
    draw(0)
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height)
    var i, j, a, b, dx, dy, dist

    /* Threads first, so spores sit on top. */
    ctx.strokeStyle = colors.thread
    ctx.lineWidth = 0.8
    for (i = 0; i < spores.length; i++) {
      a = spores[i]
      for (j = i + 1; j < spores.length; j++) {
        b = spores[j]
        dx = a.x - b.x
        dy = a.y - b.y
        dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < THREAD_DIST) {
          // Bend each thread a little so it looks grown, not ruled.
          var bend = (((i * 7 + j * 13) % 9) - 4) * 3
          ctx.globalAlpha = (1 - dist / THREAD_DIST) * 0.35
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.quadraticCurveTo((a.x + b.x) / 2 + bend, (a.y + b.y) / 2 - bend, b.x, b.y)
          ctx.stroke()
        }
      }
      if (mouse.on) {
        dx = a.x - mouse.x
        dy = a.y - mouse.y
        dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_DIST) {
          ctx.globalAlpha = (1 - dist / MOUSE_DIST) * 0.6
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(a.x, a.y)
          ctx.stroke()
          ctx.lineWidth = 0.8
        }
      }
    }

    /* Spores: a soft halo, then the dot. */
    ctx.fillStyle = colors.spore
    for (i = 0; i < spores.length; i++) {
      a = spores[i]
      ctx.globalAlpha = a.alpha * 0.18
      ctx.beginPath()
      ctx.arc(a.x, a.y, a.r * 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = a.alpha
      ctx.beginPath()
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function step(time) {
    for (var i = 0; i < spores.length; i++) {
      var s = spores[i]
      s.x += s.vx + Math.sin(time / 2000 + s.phase) * 0.12
      s.y += s.vy
      if (mouse.on) {
        var dx = mouse.x - s.x
        var dy = mouse.y - s.y
        if (dx * dx + dy * dy < MOUSE_DIST * MOUSE_DIST) {
          s.x += dx * 0.004 // reach toward the cursor
          s.y += dy * 0.004
        }
      }
      if (s.y < -10) s.y = height + 10
      if (s.x < -10) s.x = width + 10
      if (s.x > width + 10) s.x = -10
    }
    draw(time)
    frame = requestAnimationFrame(step)
  }

  function start() {
    if (frame || reduced.matches || !onScreen || document.hidden) return
    frame = requestAnimationFrame(step)
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  /* Mouse position, in canvas coordinates. */
  window.addEventListener(
    'pointermove',
    function (event) {
      if (event.pointerType !== 'mouse') return
      var box = canvas.getBoundingClientRect()
      mouse.x = event.clientX - box.left
      mouse.y = event.clientY - box.top
      mouse.on = mouse.y > -MOUSE_DIST && mouse.y < height + MOUSE_DIST
    },
    { passive: true }
  )
  document.addEventListener('mouseleave', function () {
    mouse.on = false
  })

  /* Pause when not visible. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting
      onScreen ? start() : stop()
    }).observe(hero)
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start()
  })

  /* Theme toggle: re-read the palette. */
  new MutationObserver(function () {
    readColors()
    if (!frame) draw(0)
  }).observe(root, { attributes: true, attributeFilter: ['class'] })

  /* Reduce motion turned on or off while the page is open. */
  reduced.addEventListener('change', function () {
    reduced.matches ? stop() : start()
    if (reduced.matches) draw(0)
  })

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas)
  } else {
    window.addEventListener('resize', resize)
  }

  readColors()
  resize()
  start()
})()
