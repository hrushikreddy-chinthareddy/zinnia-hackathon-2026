# Incorporate TanStack Query for state management and data fetching

## Status

Accepted by Rocco Sangellino, Mackenzie Clarkson, Ryan Olsen

## Context

The consumer UI will need to make various API request. The discussion came up as to whether we need to include TanStack query to help with caching and data fetching.

## Decision

As of January 24, 2024 we determined it was not needed to bring in a library. At this time we do not need robust caching. Bringing in TanStack causes overhead the project doens't need at the moment. If requirements change we will revisit this decision and potentially incorporate it later.

## Consequences

Using just axios makes development faster at the moment as we do not need the overhead of the configuring a library.
