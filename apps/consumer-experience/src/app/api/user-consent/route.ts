export async function GET() {
  // TODO: after auth work, there will be a method that will take in cookie and do the combining for authtoken
  // const response = await fetch(
  //   'https://dev.api.zinnia.io/consumer-experience/v1/agreementToTermsAndConditions'
  // );

  // const data = await response.json();
  // console.log('IN the api', data);

  // return Response.json({ data });

  return await Response.json({
    agreedToTermsAndConditions: false,
    partyId: '',
  });
}
