/*
 * Section effects. The hero keeps its own spores (js/spores.js).
 *
 *   - The problem: water drops that shrink and dry up as they fall.
 *   - Key features: mycelium threads growing in from the edges.
 *   - How it's built: the timeline lights up step by step (CSS).
 *   - Waitlist: a few spores slowly settling down, a hint of "growing soon".
 *   - Team: no background, so the photo stays the focus.
 *
 * Colours come from the page's CSS variables. Each effect pauses when its
 * section is off screen or the tab is hidden, and with "reduce motion" on
 * it draws one still frame. The page works fine without this file.
 */
;(function () {
  'use strict'

  var root = document.documentElement
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  var small = window.matchMedia('(max-width: 700px)')

  function cssVar(name, fallback) {
    return getComputedStyle(root).getPropertyValue(name).trim() || fallback
  }

  /* Shared plumbing: a canvas behind a section that only runs while seen. */
  function effect(section, setup) {
    if (!section) return
    var canvas = document.createElement('canvas')
    canvas.className = 'section-fx'
    canvas.setAttribute('aria-hidden', 'true')
    section.classList.add('has-fx')
    section.insertBefore(canvas, section.firstChild)
    var ctx = canvas.getContext('2d')
    if (!ctx) return

    var size = { w: 0, h: 0 }
    var fx = setup(ctx, size)
    var frame = 0
    var onScreen = false

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2)
      size.w = canvas.clientWidth
      size.h = canvas.clientHeight
      canvas.width = Math.round(size.w * dpr)
      canvas.height = Math.round(size.h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fx.reset()
      fx.draw()
    }

    function loop(time) {
      fx.step(time)
      fx.draw()
      frame = requestAnimationFrame(loop)
    }

    function start() {
      if (frame || reduced.matches || !onScreen || document.hidden) return
      frame = requestAnimationFrame(loop)
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting
        onScreen ? start() : stop()
      }).observe(section)
    } else {
      onScreen = true
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start()
    })
    reduced.addEventListener('change', function () {
      reduced.matches ? stop() : start()
      fx.draw()
    })
    new MutationObserver(function () {
      fx.colors()
      fx.draw()
    }).observe(root, { attributes: true, attributeFilter: ['class'] })

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas)
    else window.addEventListener('resize', resize)

    fx.colors()
    resize()
    start()
  }

  /* ---- The problem: water drops that dry up before they land ----
     A quiet picture of the problem itself: bags drying out between
     hand sprays. Each drop drifts down, shrinks and fades away. */
  effect(document.getElementById('problem'), function (ctx, size) {
    var drops = []
    var colour = '#b58d72'

    function makeDrop(anywhere) {
      return {
        x: Math.random() * size.w,
        y: anywhere ? Math.random() * size.h * 0.8 : -12,
        r: 2.5 + Math.random() * 3,
        vy: 0.18 + Math.random() * 0.3,
        dry: 0.0025 + Math.random() * 0.004, // how fast it shrinks
        alpha: 0.3 + Math.random() * 0.3,
      }
    }

    // A teardrop: round bottom, pointed top.
    function drawDrop(d) {
      ctx.beginPath()
      ctx.moveTo(d.x, d.y - d.r * 2.2)
      ctx.quadraticCurveTo(d.x + d.r * 1.1, d.y - d.r * 0.4, d.x + d.r, d.y)
      ctx.arc(d.x, d.y, d.r, 0, Math.PI)
      ctx.quadraticCurveTo(d.x - d.r * 1.1, d.y - d.r * 0.4, d.x, d.y - d.r * 2.2)
      ctx.fill()
    }

    return {
      colors: function () {
        colour = cssVar('--taupe', colour)
      },
      reset: function () {
        var count = small.matches ? 10 : 22
        drops = []
        for (var i = 0; i < count; i++) drops.push(makeDrop(true))
      },
      step: function () {
        for (var i = 0; i < drops.length; i++) {
          var d = drops[i]
          d.y += d.vy
          d.r -= d.dry
          if (d.r < 0.4 || d.y > size.h + 10) drops[i] = makeDrop(false)
        }
      },
      draw: function () {
        ctx.clearRect(0, 0, size.w, size.h)
        ctx.fillStyle = colour
        for (var i = 0; i < drops.length; i++) {
          var d = drops[i]
          // Fainter as it dries out.
          ctx.globalAlpha = d.alpha * Math.min(1, d.r / 2.5)
          drawDrop(d)
        }
        ctx.globalAlpha = 1
      },
    }
  })

  /* ---- Key features: mycelium threads growing in from the edges ----
     Thin threads creep in from the sides and branch, the way mycelium
     colonises a bag. When they have grown, they fade and start again. */
  effect(document.getElementById('features'), function (ctx, size) {
    var tips = []
    var colour = '#b58d72'
    var phase = 'grow' // grow -> rest -> fade -> grow
    var timer = 0
    var MAX_TIPS = 36

    function seed() {
      // Start on the left, right or bottom edge, heading inwards.
      var side = Math.floor(Math.random() * 3)
      var x, y, angle
      if (side === 0) {
        x = -2
        y = Math.random() * size.h
        angle = (Math.random() - 0.5) * 1.2
      } else if (side === 1) {
        x = size.w + 2
        y = Math.random() * size.h
        angle = Math.PI + (Math.random() - 0.5) * 1.2
      } else {
        x = Math.random() * size.w
        y = size.h + 2
        angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
      }
      return { x: x, y: y, angle: angle, life: 500 + Math.random() * 500 }
    }

    function grow() {
      var alive = 0
      ctx.strokeStyle = colour
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      for (var i = tips.length - 1; i >= 0; i--) {
        var t = tips[i]
        if (t.life <= 0) continue
        alive++
        var px = t.x
        var py = t.y
        t.angle += (Math.random() - 0.5) * 0.35
        t.x += Math.cos(t.angle) * 0.7
        t.y += Math.sin(t.angle) * 0.7
        t.life--
        ctx.moveTo(px, py)
        ctx.lineTo(t.x, t.y)
        // Now and then a thread forks.
        if (tips.length < MAX_TIPS && Math.random() < 0.006) {
          tips.push({
            x: t.x,
            y: t.y,
            angle: t.angle + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6),
            life: t.life * 0.7,
          })
        }
      }
      ctx.stroke()
      // Tiny knot where each living tip is, like a growing hyphal tip.
      ctx.globalAlpha = 0.55
      ctx.fillStyle = colour
      for (var j = 0; j < tips.length; j++) {
        if (tips[j].life > 0) ctx.fillRect(tips[j].x - 0.75, tips[j].y - 0.75, 1.5, 1.5)
      }
      ctx.globalAlpha = 1
      return alive
    }

    function restart() {
      ctx.clearRect(0, 0, size.w, size.h)
      var count = small.matches ? 3 : 6
      tips = []
      for (var i = 0; i < count; i++) tips.push(seed())
      phase = 'grow'
    }

    return {
      colors: function () {
        var next = cssVar('--taupe', colour)
        if (next !== colour) {
          colour = next
          if (size.w) restart()
        }
      },
      reset: function () {
        restart()
        // With reduce motion on, show one finished network instead.
        if (reduced.matches) for (var i = 0; i < 700; i++) grow()
      },
      step: function () {
        if (phase === 'grow') {
          if (grow() === 0) {
            phase = 'rest'
            timer = 180 // ~3s at 60fps
          }
        } else if (phase === 'rest') {
          if (--timer <= 0) {
            phase = 'fade'
            timer = 120
          }
        } else {
          // Erase a little each frame until the network has faded away.
          ctx.save()
          ctx.globalCompositeOperation = 'destination-out'
          ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
          ctx.fillRect(0, 0, size.w, size.h)
          ctx.restore()
          if (--timer <= 0) restart()
        }
      },
      // Threads are drawn as they grow (in step), so nothing to redraw here.
      draw: function () {},
    }
  })

  /* ---- Waitlist: spores sinking slowly and fading as they land ---- */
  effect(document.getElementById('waitlist'), function (ctx, size) {
    var spores = []
    var colour = '#76543f'

    function makeSpore(anywhere) {
      return {
        x: Math.random() * size.w,
        y: anywhere ? Math.random() * size.h : -10,
        r: 1.4 + Math.random() * 2.2,
        vy: 0.15 + Math.random() * 0.3,
        sway: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.45 + Math.random() * 0.4,
      }
    }

    return {
      colors: function () {
        colour = cssVar(root.classList.contains('dark') ? '--sand' : '--walnut', colour)
      },
      reset: function () {
        var count = small.matches ? 20 : 45
        spores = []
        for (var i = 0; i < count; i++) spores.push(makeSpore(true))
      },
      step: function (time) {
        for (var i = 0; i < spores.length; i++) {
          var s = spores[i]
          s.y += s.vy
          s.x += Math.sin(time / 1800 + s.phase) * s.sway * 0.3
          if (s.y > size.h + 10) spores[i] = makeSpore(false)
        }
      },
      draw: function () {
        ctx.clearRect(0, 0, size.w, size.h)
        ctx.fillStyle = colour
        for (var i = 0; i < spores.length; i++) {
          var s = spores[i]
          // Fade out over the last fifth of the section, as if landing.
          var land = Math.min(1, Math.max(0, (size.h - s.y) / (size.h * 0.2)))
          ctx.globalAlpha = s.alpha * 0.25 * land
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = s.alpha * land
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      },
    }
  })

  /* ---- "How it's built": light the steps in order ---- */
  // The animation itself is CSS (css/extras.css). This only switches it on
  // while the list is in view, so it starts from the first step each time
  // the visitor scrolls to it and costs nothing when off screen.
  var stack = document.querySelector('#how-it-works .stack')
  if (stack && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        stack.classList.toggle('is-running', entries[0].isIntersecting)
      },
      { threshold: 0.4 }
    ).observe(stack)
  }
})()
