/*
 * English / Sinhala switch.
 *
 * What it does, in plain words:
 *   - The "EN | සිං" button at the top right swaps the main text of the page
 *     (hero, the problem, the five features, team heading and the waitlist
 *     form) into Sinhala, and back.
 *   - Elements to translate carry data-i18n="key". The English stays in the
 *     HTML; the Sinhala lives in SI below.
 *   - The choice is remembered on this device. Without JavaScript the page
 *     simply stays in English.
 *
 * DRAFT: these Sinhala texts are a first draft. Please have a Sinhala
 * speaker on the team read them before the site goes live, especially the
 * farming words.
 *
 * Not translated on purpose: "How it's built" (technical), the privacy
 * notice, district names and form error messages.
 */
;(function () {
  'use strict'

  var SI = {
    'hero-eyebrow': 'ශ්‍රී ලංකාව සඳහා ස්මාර්ට් වගා කුටීරය',
    'hero-title': 'උෂ්ණත්වමානය දිහා නිතර නොබලා oyster mushrooms වගා කරන්න.',
    'hero-lead':
      'ලී කුඩු බැග් 15ක් සඳහා මීටර් 1.7ක කැබිනට්ටුවක්. සෑම බැගයකටම වෙනම නොසලයකින් වතුර ඉසිනවා, ' +
      'ආර්ද්‍රතාවය රැකීමට වාතයට මීදුම එක් කරනවා, වහලේ පංකා මගින් තාපය සහ CO2 ඉවත් කරනවා, ' +
      'යමක් වැරදුණු විට ඔබගේ දුරකථනයට දැනුම් දෙනවා.',
    'cta-join': 'පොරොත්තු ලේඛනයට එක්වන්න',
    'cta-see': 'එය කරන දේ බලන්න',
    // MDTC-PENDING: the English line is hidden in index.html until MDTC agrees
    // to be named; this Sinhala text is kept ready for when it comes back.
    'hero-mdtc':'බිම්මල් සංවර්ධන හා පුහුණු මධ්‍යස්ථානය (MDTC) සමඟ එක්ව නිර්මාණය කළා.',

    'problem-eyebrow': 'ගැටලුව',
    'problem-title': 'Oyster mushrooms කුඩා වැරැද්දකටවත් ඉඩ දෙන්නේ නැහැ. එක දවසක් මඟ හැරුණොත් අස්වැන්නක් නැති විය හැකියි.',
    'problem-lead': 'කුඩා වගාකරුවන් අතින් බැග් රැක බලා ගන්නවා. ගෙදර කවුරුත් නැති දවස එනකම් එය හොඳින් සිදු වෙනවා.',
    'pairs-today': 'අද අතින් වගා කිරීම',
    'pairs-ours': '<span class="dot"></span>GrowSync සමඟ',
    'p1-today':
      '<span class="pair__label">අද අතින් වගා කිරීම</span>ඔබ දිනකට දෙතුන් වතාවක්, හැම දවසකම, අතින් බැග්වලට වතුර ඉසිනවා.',
    'p1-ours':
      '<span class="pair__label">GrowSync සමඟ</span>සෑම බැගයකටම ඉහළින් ඇති නොසලයක් එයට වතුර ඉසින අතර, ' +
      'ඉසීම් අතරතුර මීදුම් යන්ත්‍රයක් වාතය තෙතමනයෙන් තබා ගන්නවා.',
    'p2-today': '<span class="pair__label">අද අතින් වගා කිරීම</span>එක දවසක් මඟ හැරුණත් බැග් වියළී යනවා.',
    'p2-ours': '<span class="pair__label">GrowSync සමඟ</span>ඔබ එතැන සිටියත් නැතත් වතුර ඉසීම සහ මීදුම ක්‍රියාත්මක වෙනවා.',
    'p3-today': '<span class="pair__label">අද අතින් වගා කිරීම</span>වියළි කුටීරයක් 30 °C ඉක්මවූ විට අස්වැන්න නවතිනවා.',
    'p3-ours':
      '<span class="pair__label">GrowSync සමඟ</span>වහලේ පංකා සහ වතුර ඉසීමෙන් සිසිල් කිරීම තාපය අඩු කරන අතර, ' +
      'කැබිනට්ටුව 30 °C ට වඩා උණුසුම්ව පැවතුණොත් ඔබගේ දුරකථනයට දැනුම් දෙනවා.',
    'p4-today':
      '<span class="pair__label">අද අතින් වගා කිරීම</span>මෙතරම් සමීපව වගාවක් රැක බලා ගැනීමට යන කාලය සහ වියදම නිසා ' +
      'අලුත් වගාකරුවන් ඉදිරියට එන්නේ නැහැ.',
    'p4-ours':
      '<span class="pair__label">GrowSync සමඟ</span>බැග් 15ක කැබිනට්ටුවක් ආරම්භ කිරීමට කුඩා පියවරක් වන අතර, ' +
      'පසුව සම්පූර්ණ වගා කාමරයක් දක්වා විශාල කළ හැකියි.',

    'features-eyebrow': 'ප්‍රධාන විශේෂාංග',
    'features-title': 'කැබිනට්ටුව ඔබ වෙනුවෙන් කරන වැඩ පහක්.',
    'f1-title': 'තාපය පාලනය, 30 °C අනතුරු ඇඟවීමක් සමඟ',
    'f1-text':
      'කැබිනට්ටුව උණුසුම් වන විට වහලේ පංකා නැවුම් වාතය ඇතුළට ගන්නා අතර, වතුර ඉසීමෙන් එය සිසිල් කරනවා. ' +
      'විනාඩි දහයකට වඩා 30 °C ට ඉහළින් පැවතුණොත් ඔබගේ දුරකථනයට අනතුරු ඇඟවීමක් ලැබෙනවා.',
    'f2-title': 'මුලින් මීදුම, පසුව වතුර ඉසීම',
    'f2-text':
      'ආර්ද්‍රතාවය අඩු වූ විට මීදුම් යන්ත්‍රයක් බැග් මතට මීදුම යවනවා. ටික වේලාවකට පසුත් වාතය වියළි නම්, ' +
      'පේළියේ වතුර ඉසීම ආරම්භ වෙනවා.',
    'f3-title': 'සෑම බැගයකටම ඉහළින් නොසලයක්',
    'f3-text': 'රාක්ක පහේ වතුර නළ පහක්, බැග් 15න් එක් එක් බැගයට ඉහළින් සියුම් මීදුම් නොසලයක් රැගෙන යනවා.',
    'f4-title': 'ඔබගේ දුරකථනයට අනතුරු ඇඟවීම්',
    'f4-text':
      'කැබිනට්ටුවේ ඉහළ, මැද සහ පහළ කියවීම් ඇප් එක පෙන්වනවා. අධික උණුසුම, වතුර ටැංකිය අඩු වීම ' +
      'හෝ සංවේදකයක් ක්‍රියා නොකිරීම ගැන ඔබට දැනුම් දෙනවා.',
    'f5-title': 'CO2 වැඩි වන විට නැවුම් වාතය',
    'f5-text':
      'CO2 සංවේදකයක් ඇතුළත වාතය නිරීක්ෂණය කරනවා. CO2 හෝ තාපය ඉහළ ගිය විට වහලේ පංකා දෙක කෙටි වේලාවක් ' +
      'ක්‍රියා කරන අතර, පිටුපස බිත්තියේ පහළ ඇති සිදුරකින් නැවුම් වාතය ඇතුළු වෙනවා.',

    'team-title': 'පස් දෙනෙක්, එක කුටීරයක්.',
    'team-hint': 'කවුදැයි බැලීමට සහ GitHub හි සොයා ගැනීමට නමක් මත ඔබන්න.',

    'wl-eyebrow': 'පොරොත්තු ලේඛනයට එක්වන්න',
    'wl-title': 'GrowSync වගාකරුවන්ට සූදානම් වූ විට දැනුම් ලබා ගන්න.',
    'wl-lead':
      'ඔබගේ විස්තර ලබා දෙන්න. කැබිනට්ටුව ලබා ගත හැකි වූ විට අපි ඔබව සම්බන්ධ කර ගන්නම්. ' +
      'ඔබගේ දිස්ත්‍රික්කය දැන ගැනීමෙන් වගාකරුවන් සිටින ප්‍රදේශ හඳුනා ගැනීමට අපට උදව් වෙනවා.',
    'follow-label': 'අපගේ ප්‍රගතිය අනුගමනය කරන්න',
    'wa-contact': 'WhatsApp හරහා අපව අමතන්න',
    'wa-contact-2': 'WhatsApp හරහා අපව අමතන්න',
    'wa-ask': 'මේ අතරතුර ප්‍රශ්න තිබේද? WhatsApp හරහා අපට පණිවිඩයක් එවන්න.',
    'wl-name': 'නම',
    'wl-email': 'ඊමේල්',
    'wl-phone': 'දුරකථන අංකය',
    'wl-phone-hint': 'උදාහරණයක් ලෙස 071 234 5678',
    'wl-district': 'දිස්ත්‍රික්කය',
    'wl-district-hint': 'ඔබ වගා කරන, හෝ වගා කිරීමට අදහස් කරන ස්ථානය',
    'wl-choose': 'දිස්ත්‍රික්කයක් තෝරන්න',
    'wl-note':
      'අපි මෙම විස්තර GrowSync ගැන ඔබව සම්බන්ධ කර ගැනීමට පමණක් භාවිතා කරනවා. ' +
      '<a class="text-link text-link--plain" href="#privacy">රහස්‍යතා දැන්වීම</a> කියවන්න.',
  }

  // "Contact us on WhatsApp": opens a chat with the team's number and a
  // ready-made first message in the page language.
  var WHATSAPP = '94721222483'
  var HELLO = {
    en: "Hi GrowSync, I'd like to know more about the grow cabinet.",
    si: 'ආයුබෝවන් GrowSync, වගා කැබිනට්ටුව ගැන තව දැනගන්න කැමතියි.',
  }
  var contactLinks = Array.prototype.slice.call(document.querySelectorAll('[data-wa-contact]'))

  var KEY = 'growsync-lang'
  var root = document.documentElement
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'))
  var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-lang-toggle]'))
  var english = new Map() // original English markup, kept to switch back

  nodes.forEach(function (node) {
    english.set(node, node.innerHTML)
  })

  function apply(lang) {
    var si = lang === 'si'
    nodes.forEach(function (node) {
      var key = node.getAttribute('data-i18n')
      node.innerHTML = si && SI[key] ? SI[key] : english.get(node)
    })
    root.lang = si ? 'si' : 'en'
    contactLinks.forEach(function (a) {
      a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(si ? HELLO.si : HELLO.en)
    })
    toggles.forEach(function (button) {
      button.setAttribute('aria-pressed', si ? 'true' : 'false')
      button.setAttribute('aria-label', si ? 'Read this page in English' : 'Read this page in Sinhala')
    })
  }

  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = root.lang === 'si' ? 'en' : 'si'
      apply(next)
      try {
        localStorage.setItem(KEY, next)
      } catch (error) {
        // Private mode: the choice lasts for this visit only.
      }
    })
  })

  var saved = null
  try {
    saved = localStorage.getItem(KEY)
  } catch (error) {
    saved = null
  }
  if (saved === 'si') apply('si')
})()
