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
        class="bg-gray-100 p-16 my-8"
      >
        <!-- Project title -->
        <h2 class="text-4xl mb-4" v-text="result.attributes.title" />

        <div class="gap-4 flex overflow-x-auto">
          <!-- Links -->
          <a
            v-for="(link, key) of result.attributes.field_links"
            :key="key"
            class="bg-black block border border-2 border-gray-100 flex gap-1 hover:border-green-600 h-32 min-w-[16rem] my-4 pl-4 pt-2 rounded text-white w-64"
            :href="link.uri"
            target="_blank"
          >
            {{ link.title }}
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
          </a>
        </div>

        <!-- Project description -->
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="result.attributes.body"
          class="pl-8 text-gray-600 max-w-[85%] mt-8"
          v-html="result.attributes.body.processed"
        />
      </div>
      <!-- eslint-enable vue/no-v-html -->
    </template>
  </DruxtView>
</template>
