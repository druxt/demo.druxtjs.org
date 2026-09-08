/**
 * `$track(name, params)` - this site's only GA4 event entry point.
 *
 * Dispatches through the global `gtag()` defined by the inline snippet in
 * nuxt.config.js, and never by pushing to `window.dataLayer` directly. That
 * distinction is load-bearing rather than stylistic: gtag.js only processes
 * queue entries that are genuine `arguments` objects, so a pushed array
 * literal is enqueued and then silently ignored - the event never reaches
 * GA4, nothing logs an error, and the metric reads as a real zero.
 *
 * `window.gtag` is undefined in dev and on deploy previews, because the
 * snippet is gated on ANALYTICS_ENABLED, so every call here is a no-op there.
 * That is deliberate: preview traffic must not reach the production property.
 *
 * @param {object} context - The Nuxt context (unused; required by the signature).
 * @param {Function} inject - Nuxt's injector, used to expose `$track`.
 */
export default (context, inject) => {
  inject('track', (name, params = {}) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function')
      return
    try {
      window.gtag('event', name, params)
    } catch (e) {
      // Analytics must never break the interaction it is measuring.
    }
  })
}
