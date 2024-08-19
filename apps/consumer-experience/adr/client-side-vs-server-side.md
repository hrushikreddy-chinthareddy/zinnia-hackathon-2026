# MOVING FORWARD FOR CONSUMER

**Decision:** given the eventual future of building to accomodate modules that can be used across projects, we would like to gradually convert consumer to be more client side focused.

**Details:**

- pages are still server side for now -- to use for routing
- components will all be client side
- using Tanstack
- components will use RouteHandlers rather than ServerActions (even if it's a form) EXCEPT for login

* KNOWN (BUT TEMPORARY) SHORTCOMINGS

  - while we are switching components to client side, we know that pages and components might be making the same call, but some duplication will be reduced by caching

* FUTURE
  - eventually we will get to the point where pages aren't making any data calls, and each component will be responsible for retrieving its own data
  - the next step is having a hook or HOC (or whatever) that will make the data call using the authToken provided by the provider
  - The GOAL is to have it be framework agnostic to some extent, and we can replace the framework
