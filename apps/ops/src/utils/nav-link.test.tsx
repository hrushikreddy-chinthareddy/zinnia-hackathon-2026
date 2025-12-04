import { transformChildrenToString } from './nav-link';

describe('get text from nav-link components', () => {
    describe('transformChildrenToString', () => {
        it('should convert a children string node into string', () => {
            const value = 'text';
            const TestComponent = <span>{value}</span>;
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should convert a children react node with a child node into string', () => {
            const value = 'text';
            const TestComponent = (
                <div>
                    <button>
                        <img />
                        <span>{value}</span>
                    </button>
                </div>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should not convert a react node ', () => {
            const value = '';
            const TestComponent = (
                <div>
                    <img />
                </div>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should convert a children react node into string', () => {
            const value = 'text';
            const TestComponent = (
                <button>
                    <span>{value}</span>
                </button>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
    });
});
