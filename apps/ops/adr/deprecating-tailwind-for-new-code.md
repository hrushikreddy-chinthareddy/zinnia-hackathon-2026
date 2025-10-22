# Deprecating Tailwind for New Code

Decision made by: XD Engineering team

**Last updated:** 2025-10-22

**Decision**

Moving forward, we are deciding to deprecate Tailwind for new code and shift to using css modules when custom styles are necessary. We can expect to maintain tailwind usage for bugfixes and small changes, but anything major we should put in the effort to migrate to css modules when time allows.

This change aligns with the internal effort to lean on the @zinnia/bloom design system as much as possible. By requiring moving away from Tailwind, we reduce the potential for one-off styles. Adding new CSS modules is more effort and should make the engineer think twice before adding new styles that we currently do not account for with the @zinnia/bloom design system.

**Details**

-   New code or large feature updates should include porting old tailwind styles to new or existing css modules
-   Existing tailwind styles can be left in place for bugfixes and small changes

**Known Shortcomings**

-   May introduce increased effort for feature updates.
-   Porting can introduce bugs if not done carefully. Be thorough and test when porting styles and ensure the styles are equivalent to the tailwind styles.

**Future**

-   No new code should be written using tailwind. Keep this in mind when reviewing pull requests and suggest porting to css modules when possible.
