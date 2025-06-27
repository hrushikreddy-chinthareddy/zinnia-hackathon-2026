import { FieldVariant, FieldSize } from '@deps/components/fields/field';
import { mergeClasses } from '@deps/helpers/props.helpers';

export const getLabelClasses = (
    variant: FieldVariant = FieldVariant.Default,
    classNames: string
) => {
    switch (variant) {
        case FieldVariant.Default:
            return mergeClasses(classNames, 'text-gray-900');
        case FieldVariant.Inactive:
            return mergeClasses(classNames, 'text-gray-300');
        default:
            return classNames;
    }
};

export const getInputSizeClasses = (
    size: FieldSize = FieldSize.Default,
    classNames: string
) => {
    switch (size) {
        case FieldSize.Default:
            return mergeClasses(classNames, 'h-[58px] pb-4 pt-4');
        case FieldSize.Small:
            return mergeClasses(classNames, 'h-[42px] pb-2 pt-2');
        default:
            return classNames;
    }
};

export const getInputClasses = (
    variant: FieldVariant = FieldVariant.Default,
    size: FieldSize = FieldSize.Default,
    classNames: string,
    isActive = false
) => {
    let activeClasses = '';

    switch (variant) {
        case FieldVariant.Default:
            activeClasses = isActive
                ? 'border-[3px] rounded-md border-primary'
                : '';
            return mergeClasses(
                getInputSizeClasses(size, classNames),
                `bg-white border-2 border-gray-200  [&>div>svg]:text-secondary-main hover:border-accent-one active:border-[3px] active:rounded-md active:border-primary focus:border-[3px] focus:rounded-md focus:border-primary ${activeClasses}`
            );
        case FieldVariant.Inactive:
            activeClasses = isActive ? '' : '';
            return mergeClasses(
                getInputSizeClasses(size, classNames),
                `bg-gray-100 border-2 border-gray-300 [&>p]:text-gray-300 [&>div>svg]:text-gray-300 ${activeClasses}`
            );
        case FieldVariant.Success:
            activeClasses = isActive ? 'rounded-md' : '';
            return mergeClasses(
                getInputSizeClasses(size, classNames),
                `bg-white border-[3px] border-semantic-success [&>div>svg]:text-secondary-main ${activeClasses}`
            );
        case FieldVariant.Error:
            activeClasses = isActive ? 'rounded-md' : '';
            return mergeClasses(
                getInputSizeClasses(size, classNames),
                `bg-white border-[3px] border-semantic-error [&>div>svg]:text-semantic-error [&>*]:text-semantic-error ${activeClasses}`
            );
        default:
            return classNames;
    }
};
