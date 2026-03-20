export const getConnectionConfig = (connection) => {
  switch (connection) {
    // Farmers
    case 'FNWL-Consumer-Okta':
      return {
        loginSuccessUrl: `farmers.${process.env.MYPOLICYVIEW_BASE_URL}`,
        scope: 'openid email profile groups myPolicyView Zinnia',
      };
    case 'Zinnia-AD':
      return {
        loginSuccessUrl: process.env.MYPOLICYVIEW_BASE_URL,
        scope: 'openid profile email',
      };
    case 'Security-Benefit-Okta':
      return {
        loginSuccessUrl: `securitybenefit.${process.env.MYPOLICYVIEW_BASE_URL}`,
        scope: 'email offline_access openid profile',
      };
  }
};
