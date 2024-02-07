import { forwardRef, SVGProps } from 'react';

const SVGMock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        name="SVGMock"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        data-testid="mock-icon"
        ref={ref}
        {...props}
      ></svg>
    );
  }
);

SVGMock.displayName = 'SVGMock';

export default SVGMock;
