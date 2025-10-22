# Deprecating Tailwind for New Code

Decision made by: XD Engineering team

**Decision**

Moving forward, we are deciding to deprecate Tailwind for new code and shift to using css modules when custom styles are necessary. We can expect to maintain tailwind usage for bugfixes and small changes, but anything major we should put in the effort to migrate to css modules when time allows.

**Details**

-   New code or large feature updates should include porting old tailwind styles to new or existing css modules
-   Existing tailwind styles can be left in place for bugfixes and small changes

**Known Shortcomings**

-   May introduce increased effort for feature updates.
-   Porting can introduce bugs if not done carefully. Be thorough and test when porting styles and ensure the styles are equivalent to the tailwind styles.

**Future**

-   No new code should be written using tailwind. Keep this in mind when reviewing pull requests and suggest porting to css modules when possible.
