<template>
  <DruxtView view-id="projects" display-id="page_1">
    <template #default="{ results }">
      <!-- Header -->
      <div class="container mx-auto text-center py-32">
        <DruxtLogo class="w-32 mx-auto mb-2" />
        <h1 class="text-4xl">
          Made with
          <a
            class="text-green-600 font-bold hover:underline"
            href="https://druxtjs.org"
            >DruxtJS</a
          >
        </h1>
      </div>

      <!-- Demo list - Projects View -->
      <div
        v-for="result of results"
        :key="result.id"
        class="bg-gray-100 my-8 p-16"
      >
        <div class="container mx-auto">
          <!-- Project title -->
          <h2 class="text-4xl mb-4" v-text="result.attributes.title" />

          <div class="gap-4 flex overflow-x-auto">
            <!-- Items paragraphs. -->
            <DruxtEntity
              v-for="link of result.relationships.field_items.data"
              :key="link.id"
              v-bind="{
                settings: {
                  query: {
                    include: ['field_media', 'field_media.field_media_image']
                  }
                },
                type: link.type,
                uuid: link.id
              }"
              target="_blank"
            >
              <template #default="{ entity }">
                <a
                  class="bg-black block border border-2 border-gray-100 hover:border-green-600 h-36 min-w-[16rem] my-4 overflow-hidden relative rounded text-white w-64"
                  :href="entity.attributes.field_link.uri"
                  target="_blank"
                >
                  <template v-if="((entity.included || [])[1] || {}).type === 'file--file'">
                    <NuxtImg
                      class="absolute z-0"
                      :src="[$druxt.settings.baseUrl, entity.included[1].attributes.uri.url].join('/')"
                    />
                  </template>

                  <div class="absolute bg-black flex gap-1 left-1 px-2 py-1 rounded z-1 bottom-1">
                    {{ entity.attributes.field_link.title }}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-5 h-5"
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

          <!-- Project description -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="result.attributes.body"
            class="pl-8 text-gray-600 max-w-[85%] mt-8"
            v-html="result.attributes.body.processed"
          />
        </div>
      </div>
      <!-- eslint-enable vue/no-v-html -->
    </template>
  </DruxtView>
</template>
