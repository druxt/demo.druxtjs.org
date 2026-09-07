/* global describe, expect, test */

import { mount } from '@vue/test-utils'
import Logo from './Logo.vue'

describe('Logo', () => {
  test('renders the mark with the default navy ink', () => {
    const wrapper = mount(Logo)
    const paths = wrapper.findAll('path')
    expect(paths.length).toBe(3)
    expect(paths.at(2).attributes('fill')).toBe('#2F495E')
  })

  test('takes a light ink for dark grounds', () => {
    const wrapper = mount(Logo, { propsData: { ink: '#FFFFFF' } })
    expect(wrapper.findAll('path').at(2).attributes('fill')).toBe('#FFFFFF')
  })
})
