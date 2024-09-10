import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import { defineConfig } from 'cypress';
import 'dotenv/config';

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    ...process.env
  },
  e2e: {
    baseUrl: 'https://qa.open.zinnia.com/',
    specPattern: '**/*.feature',
    supportFile: false,
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode:true,
    

    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [
            createEsbuildPlugin(config)
          ],
        })
      );

      // Make sure to return the config object as it might have been modified by the plugin.
      return config;
    },
  },
});
