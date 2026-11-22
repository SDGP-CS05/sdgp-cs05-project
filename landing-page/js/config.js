/*
 * Site settings. This is the only file to edit when connecting the form.
 * Nothing here is secret: a form endpoint is public by design.
 */
window.GROWSYNC = {
  // Form endpoint that accepts a JSON POST and answers with JSON,
  // for example a Formspree form: 'https://formspree.io/f/your-form-id'
  // Leave empty and the form says plainly that nothing was sent.
  waitlistEndpoint: '',

  // PLACEHOLDER: shown in form error messages. Keep it the same as the
  // address in index.html (footer and waitlist section).
  contactEmail: 'hello@growsync.lk',
}
