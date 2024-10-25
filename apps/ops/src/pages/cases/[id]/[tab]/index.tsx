import caseRouteHandler, { getServerSideProps as gssp } from '..';

export const getServerSideProps = gssp;

// The /cases/:id/:tab route is the /cases/:id route with a little more information.
// DEPU-2161
export default caseRouteHandler;
