# Developer Onboarding

## What is CUI?

See [here](https://zinnia.atlassian.net/wiki/spaces/AU/pages/3889922062/Consumer+UI+CUI+Quick+Links) for more details about the project and team-wide resources.

## First steps

### Setting up your user

#### User access

A real consumer will only have access to products on their account, however, for development purposes it's helpful to have an extra layer of access so that you can view any contract.

1. Go to [access management tool](http://alb-dep-qa-1124930781.us-east-1.elb.amazonaws.com/)
1. find your user
1. add `zinnia processor` access
   > If you do not have access to the access management tool, request it in engineering channel.

#### Adding Products

> Creating a policy will create your Auth0 user as well. This will allow access to Consumer

If you do not currently have any products associated with your account or need a different product added:

- [Create a policy](./make-a-new-policy.md)
- Create an annuity:
  - follow instructions in [making a new policy](./make-a-new-policy.md)
  - and then follow [annuity specific steps](./make-a-new-policy.md#for-fixed-annuity)

> The Policy vs Annuity language is a little misleading. We use "policies" to mean "life" products specifically. You'll see `LineOfBusiness` everywhere to differentiate. LIFE === policies, ANNUITY === annuities.

### Dev Menu and Mock Data

To use the dev menu add the query string `..show_dev_menu..=true`. From there you can:

- turn on mock data
- show test policies -> show more than just your user's policies (if you don't see anything after turning this on, it means you need to increase your user access to see policies that are not on your user.)
- create errors for diffent API endpoints

## Developing in the project

- Try to keep components as "dumb" as possible. Pass data down as a prop and make the data call in the parent component

### Server Side vs Client Side

- Server side components make use of Next 14's server actions to retrieve data.
- Components that require more client side interaction (e.g. one time premium payment flow and add/remove bank and address -- essentially any transactions) use TanStack, routehandlers and zustand. Though there are more steps to retrieve the data on the client side, both server and client side components will ultimately use the same transformers.
- We have a queries folder for Tanstack query functions to keep them in one place and make them easily reusable

#### Adding an API call: server-side, router handler vs server actions

1. server methods -> server rendered pages and components
2. route handlers -> reusable client side api
3. server actions -> need client side to call server methods, but not something the client-side will need to reuse often
   > NOTE: Sometimes something might start as a server action but need to become a route handler

**Put into analogy terms**

Server actions are like components and the route handler is like the page
because the route handler "exposes" the server action at a specific location, but server actions can be reused in multiple places

### Styling

We use [Bloom components](https://zinnia-design-system.supernova-docs.io/latest) wherever possible. For everything else, there's a mix of global, css modules and utility classes in the project. We decided to add utility classes for things like [spacing](src/app/styles/spacing.css) and [borders](src/app/styles/borders.css) so that devs wouldn't have to make an additional style file for simple components.

## Middleware - WIP

This file feels incredibly complicated since we have to shove all middleware checks into one file (thanks, Next), but there is some history behind all of the checks that helps to understand what is going on.

- one policy vs multiple policies vs multiple policies on different carriers
- has signed terms and conditions -- this is zinnia specific and will only appear once on initial log in (i.e. does not show for each policy)
  - if you have already agreed to this, but need to see it again, Rocco has access to the db to clear it per user (TODO: get more people access)
- policy acknowledgement check
- friendly urls
- subdomain -> theme

## History of the project a.k.a hindsight is 20/20

When we started, we were creating super specific server functions to retrieve policy data, however, we've since decided that while some of those functions do require that specificity (e.g. transaction history), it's more tedious to make a Promise.AllSettled to retrieve different info from the same policy call, so we've created a transformer to get basic policy data that is used often. So if you need to retrieve something like the carrierId, use that call.

## Gotchyas - WIP

- client-http vs server-http vs enterprise-api-token-http
