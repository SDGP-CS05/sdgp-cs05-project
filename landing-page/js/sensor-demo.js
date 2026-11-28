/*
 * Demo sensor card. The numbers are made up and the card says "demo".
 * It shows what the grower sees: humidity drifts down, the mist kicks in,
 * humidity climbs back. Small random walk, one update every 2.5 s.
 */
;(function () {
  'use strict'

  var card = document.getElementById('sensor-demo')
  if (!card) return

  var humEl = document.getElementById('s-hum')
  var tempEl = document.getElementById('s-temp')
  var co2El = document.getElementById('s-co2')
  var mistEl = document.getElementById('s-mist')

  var hum = 88
  var temp = 26
  var co2 = 620
  var misting = false

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function tick() {
    // Humidity: drifts down, mist pushes it back up.
    hum += misting ? 1.3 : -0.5 + (Math.random() - 0.5) * 0.8
    if (hum < 85) misting = true
    if (hum > 91) misting = false
    hum = clamp(hum, 82, 94)

    temp = clamp(temp + (Math.random() - 0.5) * 0.4, 24, 28)
    co2 = clamp(co2 + (Math.random() - 0.5) * 80, 500, 900)

    humEl.textContent = Math.round(hum)
    tempEl.textContent = temp.toFixed(1)
    co2El.textContent = co2 > 800 ? 'fans on' : 'low'
    mistEl.textContent = misting ? 'on' : 'idle'
    card.classList.toggle('is-misting', misting)
  }

  tick()
  setInterval(function () {
    if (!document.hidden) tick()
  }, 2500)
})()
