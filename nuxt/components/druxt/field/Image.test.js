/* global describe, expect, jest, test */

import { shallowMount } from '@vue/test-utils'
import Image from './Image.vue'

// The mixin is Druxt's field plumbing. Only its props matter here, and
// pulling the real one in would transform the whole druxt stack for one
// method.
jest.mock('druxt-entity', () => ({
  DruxtFieldMixin: { props: ['model', 'schema'] },
}))

// The field override renders a Drupal image file through NuxtImg, so the
// source has to be an absolute URL on the backend rather than the relative
// path JSON:API returns.
describe('Image field', () => {
  const mount = (baseUrl) =>
    shallowMount(Image, {
      propsData: { model: { data: { id: 'file-uuid' } }, schema: {} },
      mocks: { $druxt: { settings: { baseUrl } } },
      stubs: ['DruxtEntity', 'NuxtImg'],
    })
  const entity = {
    attributes: { uri: { url: '/sites/default/files/demo.png' } },
  }

  test('resolves the file URI against the backend', () => {
    expect(mount('https://cms.example.org').vm.src(entity)).toBe(
      'https://cms.example.org/sites/default/files/demo.png'
    )
  })

  test('does not double the slash when the backend URL has a trailing one', () => {
    expect(mount('https://cms.example.org/').vm.src(entity)).toBe(
      'https://cms.example.org/sites/default/files/demo.png'
    )
  })
})
