import analyticsRouteHandler, { getServerSideProps as gssp } from '..';

export const getServerSideProps = gssp;

// The /analytics/:tab route is the /analytics route with a little more information.
export default analyticsRouteHandler;
