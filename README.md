# demo.druxtjs.org

> Made with DruxtJS

This is the source code for https://demo.druxtjs.org.


## How to use it

Your environment contains a pre-install, pre-configured and running instance of Drupal with Tome, and Nuxt with Druxt.

You can access the services in your browser, via the **Remote Explorer** extension, or via the URL pattern: `https://[PORT]-[GITPOD_ID].[GITPOD_SERVER].gitpod.io`


## Services

| Port | Service |
| -- | -- |
| `3000` | Nuxt.js |
| `3003` | Storybook |
| `8080` | Drupal |


## Tools

### DDEV

> DDEV is an open source tool that makes it dead simple to get local PHP development environments up and running within minutes. 

DDEV is used to manage the Drupal instance, and provides a CLI that can be used to run common drupal tasks, including `ddev drush`.

These commands should be run from within the `/drupal` folder.

Refer to the documentation for more details: https://ddev.readthedocs.io


### @nuxtjs/storybook

> Storybook integration with NuxtJS .

Druxt integrates with the Nuxt Storybook module to provide zero-configuration, auto-discovery stories with access to live data from your Drupal backend.

To start Storybook, navigate to the `nuxt` directory and run `npx nuxt storybook`.


### Tome sync

Tome sync is a static storage system for content, allowing you to keep your content up to date without the need of a database.

See the project page for more details: https://www.drupal.org/project/tome


## License

[MIT](https://github.com/druxt/druxt.js/blob/develop/LICENSE)
