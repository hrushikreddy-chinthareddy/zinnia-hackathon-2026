export const getComponentVisibilityQuery = async (
  planCode: string,
  policyNumber: string
) => {
  if (!planCode || !policyNumber) {
    throw new Error('planCode and policyNumber are required');
  }
  const response = await (
    await fetch(`/api/component-visibility/${planCode}/${policyNumber}`)
  ).json();

  return response;
};
