# REPLACING CLIENT SIDE FETCHING WITH TANSTACK

Decision made by: xxxxx

**Decision:**

We want to reduce the number of clientside network requests happening, and tanstack offers a solution by way of a built in cache, alongside tooling to help us with development.

We will go through the app section by section and replace clientside fetching with tanstack as needed. We will also examine any `getServersideProps` functions to determine if any data fetching happening there can be removed in favor of the tanstack clientside fetching, since the clientside fetching gives us access to the cache.

**Details:**

-   Gradually replace any fetch requests inside of `useEffects` with tanstack.
-   Replace posts with tanstack `useMutation` hook to trigger cache refreshes automatically.
-   Remove any `getServersideProps` fetches that are duplicates of the clientside fetches.

*   KNOWN SHORTCOMINGS

-   Serverside data fetching is still necessary at some level for translations on the page.
-   It will require the team to learn new patterns that are different from what we're used to.

*   FUTURE

-   If we get our pages to a place where SSR is no longer needed, it would be a more simple task to migrate from Next to a fully clientside app.
