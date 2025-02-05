import { withPageAuthRequired } from '@auth0/nextjs-auth0';

const ContactCenter = () => {
    return (
        <div className="flex flex-col gap-4 p-8">
            <a target="_blank" href="/contact-center/send-taxform?planCode=SBFIXUL1&policyNumber=MC53227658">
                Send Tax Forms{' '}
            </a>
            <a target="_blank" href="/contact-center/send-correspondence">
                Send Correspondence
            </a>
            <a target="_blank" href="/contact-center/send-document">
                Send Document{' '}
            </a>
        </div>
    );
};
export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async () => {
        return {
            props: {},
        };
    },
});

export default ContactCenter;
