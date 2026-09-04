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
            <span class="text-brand-green">Nuxt</span>
          </h1>
          <p class="mx-auto mb-8 max-w-xl text-lg text-ink-muted">
            Every demo below is a working Drupal backend and a Druxt frontend,
            deployed from a public repository you can read, fork and run
            yourself.
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

          <!-- Item paragraphs -->
          <div
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]"
          >
            <DruxtEntity
              v-for="link of result.relationships.field_items.data"
              :key="link.id"
              v-bind="{
                settings: {
                  query: {
                    include: ['field_media', 'field_media.field_media_image'],
                  },
                },
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
                  @click="
                    $track('demo_click', {
                      demo: result.attributes.title,
                      link: entity.attributes.field_link.title,
                      url: entity.attributes.field_link.uri,
                    })
                  "
                >
                  <div class="aspect-[16/10] overflow-hidden bg-ink-shot">
                    <NuxtImg
                      v-if="
                        ((entity.included || [])[1] || {}).type === 'file--file'
                      "
                      class="h-full w-full object-cover opacity-90 group-hover:opacity-100"
                      height="180"
                      loading="lazy"
                      :src="
                        [
                          $druxt.settings.baseUrl,
                          entity.included[1].attributes.uri.url,
                        ].join('/')
                      "
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
