import Link from 'next/link';

interface SelectSearchItemProps {
    fieldLabel: string;
    data?: string;
    href?: string;
    className?: string;
}

const SelectSearchItem = ({ fieldLabel, data, href, className }: SelectSearchItemProps) => {
    return (
        <div tabIndex={0} className={`${className}`}>
            <div className="flex bg-white px-4 pb-2 pt-2">
                <div className="flex flex-col">
                    <div>
                        <p className="font-primary text-sm font-semibold leading-4.5 text-gray-900">{fieldLabel}</p>
                        <p className="font-secondary text-md leading-5.5 text-gray-900">{data}</p>
                        {href && (
                            <p className="flex h-[21px] ">
                                <Link href={href} className="font-primary text-md font-medium leading-5.5 text-secondary">
                                    {href}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectSearchItem;
