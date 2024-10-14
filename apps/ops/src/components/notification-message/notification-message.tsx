import { ReactComponent as Cancel } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as BellIcon } from '@deps/styles/elements/icons/icons_outlined/bell.svg';

interface NotificationInterface {
    message: string;
    onClose: React.Dispatch<React.SetStateAction<any>>;
}

const NotificationMessage = ({ message, onClose }: NotificationInterface) => {
    return (
        <div className="flex items-center justify-between rounded-lg border border-[#207B5A]  bg-[#F2F9F7] p-4 shadow-md">
            <div className="flex items-center">
                <div className="mr-3 h-5 w-5 rounded-full ">
                    <BellIcon width={23} height={23} className="text-[#207B5A]" />
                </div>
                <p className="text-bold">{message}</p>
            </div>
            <div onClick={onClose} className="hover:cursor-pointer hover:text-gray-700">
                <Cancel width={25} height={25} className="text-[#207B5A]" />
            </div>
        </div>
    );
};

export default NotificationMessage;
