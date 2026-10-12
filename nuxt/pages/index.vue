<template>
  <DruxtView view-id="projects" display-id="page_1">
    <template #default="{ results }">
      <!-- Site header -->
      <header
        class="sticky top-0 z-10 border-b border-ink-rule bg-ink-edge/80 backdrop-blur"
      >
        <div class="mx-auto flex h-16 max-w-5xl items-center gap-3 px-6">
          <DruxtLogo class="w-7" ink="#E5ECF1" />
          <span class="font-semibold tracking-tight">DruxtJS</span>
          <nav class="ml-auto flex gap-6 text-sm">
            <a
              class="text-ink-muted hover:text-ink-text"
              href="https://druxtjs.org"
              >Docs</a
            >
            <a
              class="text-ink-muted hover:text-ink-text"
              href="https://druxtjs.org/modules"
              >Modules</a
            >
            <a
              class="text-ink-muted hover:text-ink-text"
              href="https://github.com/druxt/druxt.js"
              >GitHub</a
            >
          </nav>
        </div>
      </header>

      <div class="mx-auto max-w-5xl px-6">
        <!-- Hero -->
        <section class="py-20 text-center sm:py-24">
          <DruxtLogo class="mx-auto mb-6 w-20" ink="#E5ECF1" />
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal"
          >
            Live demos
          </p>
          <h1
            class="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            Real Drupal sites,<br />decoupled with
            <span class="text-brand-green">Druxt</span>
          </h1>
          <p class="mx-auto mb-8 max-w-xl text-lg text-ink-muted">
            Every demo below is a working Drupal backend serving JSON:API and a
            Nuxt frontend that renders it, deployed from a public repository you
            can read, fork and run yourself.
          </p>
          <a
            class="inline-flex items-center rounded-md bg-brand-green px-6 py-3 font-semibold text-ink-deep hover:bg-brand-green-hi"
            href="https://druxtjs.org/tutorials/getting-started"
            >Get started</a
          >
          <a
            class="ml-5 font-medium text-brand-link hover:text-brand-link-hi"
            href="https://druxtjs.org"
            >Read the docs &rarr;</a
          >
        </section>

        <!-- Demo list, one section per Projects view result -->
        <section
          v-for="result of results"
          :key="result.id"
          class="border-t border-ink-rule py-14"
        >
          <h2 class="mb-3 text-2xl font-semibold tracking-tight">
            <span
              class="mr-3 inline-block h-2 w-2 rounded-full bg-brand-green align-middle"
            />
            <span v-text="result.attributes.title" />
          </h2>

          <!-- Project description -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="result.attributes.body"
            class="mb-7 max-w-3xl text-ink-muted"
            v-html="result.attributes.body.processed"
          />
          <!-- eslint-enable vue/no-v-html -->

          <!-- The first item is the feature: the thing a visitor can go and
               do. The rest keep the tile grid. Content decides which is which
               by its order in field_items, so this needs no extra field. -->
          <DruxtEntity
            v-if="feature(result)"
            :key="feature(result).id"
            v-bind="{
              settings: { query: { include: includes } },
              type: feature(result).type,
              uuid: feature(result).id,
            }"
          >
            <template #default="{ entity }">
              <a
                class="group mb-4 grid overflow-hidden rounded-lg border border-brand-green bg-ink-surface transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-link sm:grid-cols-[1.3fr_1fr]"
                :href="entity.attributes.field_link.uri"
                target="_blank"
                rel="noopener"
                @click="track(result, entity)"
              >
                <div class="aspect-[16/10] overflow-hidden bg-ink-shot">
                  <NuxtImg
                    v-if="imageOf(entity)"
                    :alt="altOf(entity)"
                    class="h-full w-full object-cover object-top opacity-90 group-hover:opacity-100"
                    height="400"
                    loading="lazy"
                    :src="fileUrl(imageOf(entity))"
                    width="640"
                  />
                </div>
                <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
                  <span
                    class="w-fit rounded-full border border-ink-rule bg-ink-bg px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-brand-teal"
                  >
                    The thing to try
                  </span>
                  <span
                    class="text-xl font-semibold"
                    v-text="entity.attributes.field_link.title"
                  />
                  <span
                    class="inline-flex w-fit items-center rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-ink-deep group-hover:bg-brand-green-hi"
                  >
                    {{ entity.attributes.field_link.title }}
                  </span>
                </div>
              </a>
            </template>
          </DruxtEntity>

          <!-- Item paragraphs -->
          <div
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]"
          >
            <DruxtEntity
              v-for="link of supporting(result)"
              :key="link.id"
              v-bind="{
                settings: { query: { include: includes } },
                type: link.type,
                uuid: link.id,
              }"
            >
              <template #default="{ entity }">
                <a
                  class="group block overflow-hidden rounded-lg border border-ink-rule bg-ink-surface transition-colors duration-150 hover:border-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-link motion-safe:hover:-translate-y-0.5 motion-safe:transition"
                  :href="entity.attributes.field_link.uri"
                  target="_blank"
                  rel="noopener"
                  @click="track(result, entity)"
                >
                  <div class="aspect-[16/10] overflow-hidden bg-ink-shot">
                    <NuxtImg
                      v-if="imageOf(entity)"
                      :alt="altOf(entity)"
                      class="h-full w-full object-cover object-top opacity-90 group-hover:opacity-100"
                      height="180"
                      loading="lazy"
                      :src="fileUrl(imageOf(entity))"
                      width="320"
                    />
                  </div>
                  <div
                    class="flex items-center gap-2 px-4 py-3 text-sm font-semibold"
                  >
                    {{ entity.attributes.field_link.title }}
                    <svg
                      class="ml-auto h-4 w-4 flex-none text-ink-muted group-hover:text-brand-green"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.8"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                </a>
              </template>
            </DruxtEntity>
          </div>
        </section>

        <!-- Footer -->
        <footer
          class="flex flex-wrap gap-5 border-t border-ink-rule py-8 text-sm text-ink-muted"
        >
          <span>
            A
            <a
              class="border-b border-ink-rule hover:text-ink-text"
              href="https://druxtjs.org"
              >druxtjs.org</a
            >
            property
          </span>
          <a
            class="border-b border-ink-rule hover:text-ink-text"
            href="https://discord.druxtjs.org"
            >Discord</a
          >
          <a
            class="border-b border-ink-rule hover:text-ink-text"
            href="https://github.com/druxt/druxt.js"
            >GitHub</a
          >
          <a
            class="border-b border-ink-rule hover:text-ink-text"
            href="https://www.drupal.org/project/druxt"
            >Drupal.org</a
          >
        </footer>
      </div>
    </template>
  </DruxtView>
</template>

<script>
export default {
  data: () => ({
    includes: ['field_media', 'field_media.field_media_image'],
  }),

  methods: {
    // The first link paragraph, rendered large.
    feature(result) {
      return (result.relationships.field_items.data || [])[0]
    },

    // Everything after it, rendered as the tile grid.
    supporting(result) {
      return (result.relationships.field_items.data || []).slice(1)
    },

    // The included file, found by type rather than by position: the index
    // shifted whenever a paragraph carried a different number of includes.
    imageOf(entity) {
      return (entity.included || []).find((item) => item.type === 'file--file')
    },

    // The alt text an editor wrote, which JSON:API carries on the media's
    // image relationship rather than on the file. Empty when it is missing,
    // which scripts/check-content.mjs fails the build for.
    altOf(entity) {
      const media = (entity.included || []).find((item) =>
        String(item.type).startsWith('media--')
      )
      const image =
        media && media.relationships && media.relationships.field_media_image
      return (
        (image && image.data && image.data.meta && image.data.meta.alt) || ''
      )
    },

    // JSON:API returns the file URI as a root-relative path; resolve it
    // against the backend rather than joining, which doubled the slash.
    fileUrl(file) {
      return new URL(file.attributes.uri.url, this.$druxt.settings.baseUrl).href
    },

    track(result, entity) {
      this.$track('demo_click', {
        demo: result.attributes.title,
        link: entity.attributes.field_link.title,
        url: entity.attributes.field_link.uri,
      })
    },
  },
}
</script>
