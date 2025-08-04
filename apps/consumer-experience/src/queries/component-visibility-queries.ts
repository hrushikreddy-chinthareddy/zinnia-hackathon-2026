export const getComponentVisibilityQuery = async (
  planCode: string,
  policyNumber: string
) => {
  const response = await (
    await fetch(`/api/component-visibility/${planCode}/${policyNumber}`)
  ).json();

  return response;
};
