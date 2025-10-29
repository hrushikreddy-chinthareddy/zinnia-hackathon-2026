---
# These are optional elements. Feel free to remove any of them.
status: proposed
date: 2025-10-29
decision-makers: Mackenzie, Ed, Alex W
consulted: { Mackenzie, Alex W }
informed: { Alex Wicks, Mackenzie, Ed }
---

# Adding Variables and Variations to consumer feature flags

Adding variables to optimizely feature flags for carrier level flags

## Context and Problem Statement

We have a scenario where we have a specific carrier who wants to view something enabled in QA, but disabled in production. We do not want to disable the flag for all carriers in production, and we want to avoid putting in specific code into the codebase for a carrier.

## Considered Options

- Have multiple carrier specific flags for a single feature
- A single feature flag with variables added and then assign `variants` to QA/Production

## Decision Outcome

A single feature flag with variables added and variants to control qa/prod

<!-- This is an optional element. Feel free to remove. -->

### Consequences

- Good, because we have a scaleable pattern that will let us avoid adding carrier specific versions of every individual feature flag.
- Bad, because now we'll need to add variables and variants in addition to the feature flags.

### Confirmation

We had a call going over the future pattern. We decided from the API response that we could easily access the flag variables and access them based on the carrier you're currently viewing.

## Pros and Cons of the Options

### Multiple carrier specific flags

For example, if we have a flag: "TEST_FEATURE_FLAG_1", we would need to have an "EVERLY_TEST_FEATURE_FLAG_1" and "FARMERS_TEST_FEATURE_FLAG_1", etc.

- Good, because it's very obvious what the flag does and can be seen at a glance where its on/off

- Bad, because this will require us to make many carrier specific flags, and then also force us to figure out some sort of naming pattern that must be followed so that the UI can use regex or something similar to get the carrier ID and match it with the page the user is viewing.
- … <!-- numbers of pros and cons can vary -->

### Single feature flag with variables and variations

We have a single flag for each feature, then use the `variables` section to create a variable per carrier that needs to be "disabled" or "enabled" in specific instances. We then tie these variables to variants that match with QA/Prod and can alter them in the variants.

- Good, because it consolidates logic in a single place
- Good, because it gives us an easy way to access variables inside the UI and make feature flag decisions
- Good, because it feels like this is the most 'optimizely' way of doing things.
- Neutral, because it will require some knowledge of how feature flags are set up.

<!-- This is an optional element. Feel free to remove. -->

## More Information

Sample API response from our optimizely call:

```
{
  "test_carrier_flag": {
    "variationKey": "on",
    "enabled": true,
    "variables": {
      "everly": false,
     },
    "ruleKey": "default-rollout-485737-28881700375",
    "flagKey": "test_carrier_flag",
    "userContext": {},  // Object shown as [e] in original
    "reasons": []
  }
}
```

We need to structure our logic to basically PREFER the variable object values, but default to the `enabled` value if the variable object does not have the `key` of the carrier we're looking at.

We will need to write logic in the UI to access the variables in the following way:

1. Check flag "enabled" value. If false, return "OFF" for all
2. If true, check the `variables` section. If no variables exist, use the `enabled` flag value.
3. If variables exist, check if current carrier Id exists in the variable section. If it exists, use the variable value.

## Suggested Steps:

1. Currently our feature flags decision code only returns true/false values for feature.
   ` public async getFeatureFlagDecisions(userId: string): Promise<FeatureFlags> {`

2. We should either modify this function to also take in a carrierId, or create a new function that does take in a carrierId. Then implement the logic described in the section above.
