import LogoImage from '@/app/styles/everly/everly-logo.svg';

interface Props {
  className?: string;
  expanded?: boolean;
  includeLogo?: boolean;
}

export const HeaderPolicyDetails = ({
  className,
  expanded = false,
  includeLogo,
}: Props) => {
  return (
    <div className={className}>
      {includeLogo && (
        <LogoImage
          alt="Company Logo"
          className="mb-2 w-24 shrink-0 self-center text-primary sm:hidden"
        />
      )}
      <p className="typography-labels-label-md-alt">
        Everly Life - Universal Life
      </p>
      <p className="typographyLabelsLabelSmAlt text-gray-600">
        Policy No. AU22029654
      </p>
      {expanded && (
        <>
          <p className="typographyLabelsLabelSmAlt text-gray-600">
            Insured: Michael Williams
          </p>
          <p className="typographyLabelsLabelSmAlt text-gray-600">
            Policy status: <span className="text-semantic-success">Active</span>
          </p>
        </>
      )}
    </div>
  );
};
