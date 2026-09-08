/* global afterEach, describe, expect, jest, test */

import plugin from './analytics.client.js'

function install() {
  const injected = {}
  plugin({}, (name, fn) => {
    injected[name] = fn
  })
  return injected.track
}

describe('$track', () => {
  afterEach(() => {
    delete window.gtag
  })

  test('is injected as $track', () => {
    expect(typeof install()).toBe('function')
  })

  test('does nothing where the snippet is not loaded', () => {
    const track = install()
    expect(() => track('demo_click', { demo: 'umami' })).not.toThrow()
  })

  test('dispatches through gtag, never the data layer', () => {
    window.gtag = jest.fn()
    install()('demo_click', { demo: 'umami' })
    expect(window.gtag).toHaveBeenCalledWith('event', 'demo_click', {
      demo: 'umami',
    })
  })

  test('defaults the parameters to an empty object', () => {
    window.gtag = jest.fn()
    install()('demo_click')
    expect(window.gtag).toHaveBeenCalledWith('event', 'demo_click', {})
  })

  test('never lets a failing gtag break the interaction', () => {
    window.gtag = () => {
      throw new Error('blocked')
    }
    expect(() => install()('demo_click')).not.toThrow()
  })
})
