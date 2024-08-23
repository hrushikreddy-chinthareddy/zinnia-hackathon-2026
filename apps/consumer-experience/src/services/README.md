# Paradigm of API development

The intention with API development for this project is to make each return essentially agnostic of the UI. While the specific data returned is _informed_ by the UI, the structure is the bridge between the backend and the frontend, so any filtering or sorting should (in most cases) be considered frontend logic.

## Some Considerations

1.  APIs should explicitly set which values are returned.

    For example, rather than returning

    ```
    {...objectFromPolicyAPI, ...objectFromFundsAPI}
    ```

    return

    ```
    {
      fundName: objectFromFundsAPI.fundName,
      fundValue: objectFromPolicyAPI.fundValue
    }
    ```

    It may feel rendundant, but it will prevent any unsanitized PII from being returned in the frontend call.

2.  Determining whether something should have its own function/route handler vs adding to the policyDetails return
