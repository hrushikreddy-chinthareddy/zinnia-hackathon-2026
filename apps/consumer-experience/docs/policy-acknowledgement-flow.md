# Policy Acknowledgement

See this [doc](https://zinnia.atlassian.net/wiki/spaces/AU/pages/4728488023/Policy+Acknowledgement#User-Journey) to learn more about the policy acknowledgement flow.

From a dev perspective, the important part is that we need to verify that a user has acknowledged their policy before they view any interior pages (except for the policy document). To do this, we set a cookie on initial view and then subsequently check that cookie in middleware on each page navigation.

```mermaid
graph TD
  %% Middleware Flow
  subgraph Middleware Flow
    A[Policy is in cookie?]
    A -- Yes --> B[Redirect to policy page]
    A -- No --> C[Call /checkEligibility endpoint]
    C -- Returns false --> B
    C -- Returns true --> D[Redirect to /coverage page]
  end
  %% Login Flow
  subgraph Login Flow
    E[User logs in]
    E --> F[User has a single policy?]
    F -- Yes --> A
    F -- No --> D
  end
  %% Coverage Page Flow
  subgraph Coverage Page Flow
    G[Loop over user policies]
    G --> H[Policy is in cookie?]
    H -- Yes --> I[Display policy overview component]
    I --> J[User clicks on policy overview component]
    J --> K[Redirect to policy overview page]
    K --> A
    H -- No --> L[Call /checkEligibility endpoint]
    L -- Returns true --> M[Display acknowledge policy component]
    M --> N[User checks acknowledge policy box]
    N --> O[Add policyNumber to cookie]
    O --> K
    L -- Returns false --> I
  end
```

## To test flow

1. [Make a new policy](./MakeANewPolicy.mdx)
1. [Set delivery preference](./update-policy-delivery-preference.md)
