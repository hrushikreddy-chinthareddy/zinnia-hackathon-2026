import { setCookie } from 'cookies-next';

// This helper should only be used on NextJs pages inside getServerSideProps.
// Its only purpose is to serve as a single location for the logout URL and to set a cookie that can be retrieved by the welcome page
export const serverSidePropsLogout = () => {
    setCookie('zlSessionTimeout', true, { maxAge: 60 * 60 * 24, path: '/' });
    return {
        redirect: {
            destination: '/api/auth/logout',
            permanent: false,
        },
    };
};
