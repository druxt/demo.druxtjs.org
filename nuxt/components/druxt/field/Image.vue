<template>
  <DruxtEntity type="file--file" :uuid="model.data.id">
    <template #default="{ entity }">
      <NuxtImg :src="src(entity)" />
    </template>
  </DruxtEntity>
</template>

<script>
import { DruxtFieldMixin } from 'druxt-entity'
export default {
  mixins: [DruxtFieldMixin],
  methods: {
    src(entity) {
      // JSON:API returns the file URI as a root-relative path; resolve it
      // against the backend rather than joining, which doubled the slash.
      return new URL(entity.attributes.uri.url, this.$druxt.settings.baseUrl)
        .href
    },
  },
}
</script>
