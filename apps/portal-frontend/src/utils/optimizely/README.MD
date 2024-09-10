# Optmizely Feature Flagging

**WIP**

## Implementation

### Flag Naming

`{application-name}_{feature/experiment}_{brief-description}`- ex. `policy-management_feature_alternate-side-navigation`
Flag will be added to the `portal-frontend/src/utils/optimizely/flags.ts`- `FEATURE_FLAGS` enum

### Optimizely Platform

Flag will need to be initialized on the [Optimizely platform](https://app.optimizely.com/v2/projects/25242550505/flags/list)

### `getFeatureFlagDecisions`

Will need to be implemented in the `getServerSideProps` function on any page-level component that will be using the feature
Will be passed the `user.sid` from the `getUserData` helper
ex. `const featureFlagDecisions = await optimizelyService.getFeatureFlagDecisions(user.sub);`
Will then be passed as a `prop` to the component

### `OptimizelyProvider`

The `OptimizelyProvider` context allows all children of the page to access the `featureFlags` object
This will wrap the page-level component
Developers can then access feature flags by using `const { featureFlags } = useOptimizely();`

### Placing features behind flags

A variable can be initialized checking the availablity and state of a feature flag- ex. `const showFeature = featureFlags?.[FEATURE_FLAGS.FEATURE_NAME];`
Features can be placed behind this flag in whatever way is needed- with a boolean or ternary operater
