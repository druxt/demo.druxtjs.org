<template>
  <component :is="wrapper.component" v-bind="wrapper.props" v-if="icon">
    <b-icon-puzzle font-scale="2" />

    <p class="mt-2">
      <span v-if="$scopedSlots['label-above']">
        {{ schema.label.text }}<br />
      </span>
      {{ items[0] }}
    </p>
  </component>

  <component :is="wrapper.component" v-bind="wrapper.props" v-else>
    <b-badge pill :variant="variant">{{ items[0] }}</b-badge>
  </component>
</template>

<script>
import { BIconPuzzle } from 'bootstrap-vue'
import { DruxtFieldMixin } from 'druxt-entity'

export default {
  components: { BIconPuzzle },

  mixins: [DruxtFieldMixin],

  props: {
    icon: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    variant() {
      switch (this.items[0]) {
        case 'easy':
          return 'success'
        case 'medium':
          return 'warning'
        case 'hard':
          return 'danger'
      }
      return false
    },
  },
}
</script>
