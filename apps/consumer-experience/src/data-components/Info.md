# Tell me about this folder!

This folder is for components that are specific to data or that make data calls. These components would be less useful outside of a very specific context.

# How do I know if this is the right folder for me?

1. Is your component making a data call and therefore a huge "No Thank You" as far as adding to Storybook goes? This might be the right place for you. See [footnote](../data-components/Info.md#testability)
1. If your component could potentially be used outside of this app, put it in the plain `/components` folder

# A good example

A good example of a data component vs a plain component is `AccountValue` vs the `FieldData` component. `AccountValue` makes a data call and is used very specifically while `FieldData` is just a way to render any data that is passed to it.

FOOTNOTES

1. Components should be as testable as possible(##testability) and should therefore, in ThEOry not be making data calls BUT we all know that's just not the case sometimes. A good example here is a component that renders based on a url query param. That component will need to be client side. That being said, the component that is making the data call should be comprised of smaller components that are testable.
