<template>
  <component :is="wrapper.component" v-bind="wrapper.props">
    <!-- Label: Above -->
    <div v-if="$scopedSlots['label-above']">
      <h3>{{ schema.label.text }}</h3>
    </div>

    <!-- Label: Inline -->
    <slot v-if="$scopedSlots['label-inline']" name="label-inline" />

    <!-- Items -->
    <b-list-group>
      <b-list-group-item v-for="(item, key) of items" :key="key">
        {{ item }}
      </b-list-group-item>
    </b-list-group>
  </component>
</template>

<script>
import { DruxtFieldMixin } from 'druxt-entity'

export default {
  mixins: [DruxtFieldMixin],
}
</script>
