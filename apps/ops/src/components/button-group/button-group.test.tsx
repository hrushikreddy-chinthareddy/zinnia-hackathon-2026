import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { ButtonGroupTest } from '@deps/jest/constants/test-id-constants';

import ButtonGrp from './button-group';

const buttonGroupLabels = [
    {
        label: 'button-1',
        value: '1',
    },
    {
        label: 'button-2',
        value: '2',
    },
];
let buttonGroupActive = buttonGroupLabels[0].value;
const buttonGroupToggle = (value: string) => {
    buttonGroupActive = value;
};
const groupLabel = 'button group label';

afterEach(cleanup);

describe('Button Group Component', () => {
    it('should render an MUI button group component', () => {
        render(
            <ButtonGrp
                groupLabel={groupLabel}
                labels={buttonGroupLabels}
                activeValue={buttonGroupActive}
                toggle={buttonGroupToggle}
            />
        );
        expect(screen.getByTestId(ButtonGroupTest.TOGGLE)).toBeInTheDocument();
    });

    it('should render each of the labels from props', () => {
        render(
            <ButtonGrp
                groupLabel={groupLabel}
                labels={buttonGroupLabels}
                activeValue={buttonGroupActive}
                toggle={buttonGroupToggle}
            />
        );
        buttonGroupLabels.forEach((item) => {
            expect(
                screen.getByTestId(`${ButtonGroupTest.LABEL}-${item.label}`)
            ).toBeInTheDocument();
        });
    });

    it('should trigger the toggle function when the toggle button is clicked', () => {
        render(
            <ButtonGrp
                groupLabel={groupLabel}
                labels={buttonGroupLabels}
                activeValue={buttonGroupActive}
                toggle={buttonGroupToggle}
            />
        );
        fireEvent.click(
            screen.getByTestId(
                `${ButtonGroupTest.LABEL}-${buttonGroupLabels[1].label}`
            )
        );
        expect(buttonGroupActive).toBe(buttonGroupLabels[1].value);
    });
});
