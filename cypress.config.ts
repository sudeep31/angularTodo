import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        specPattern: 'cypress/e2e/features/**/*.feature',
        supportFile: 'cypress/support/e2e.ts',
        fixturesFolder: 'cypress/fixtures',
        screenshotsFolder: 'cypress/screenshots',
        videosFolder: 'cypress/videos',
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        defaultCommandTimeout: 8000,
        requestTimeout: 10000,
        retries: {
            runMode: 2,
            openMode: 0,
        },
        env: {
            apiUrl: 'http://localhost:3000',
            omitFiltered: true,
            filterSpecs: true,
        },
        async setupNodeEvents(on, config) {
            await addCucumberPreprocessorPlugin(on, config);
            on(
                'file:preprocessor',
                createBundler({ plugins: [createEsbuildPlugin(config)] }),
            );
            return config;
        },
    },
});
