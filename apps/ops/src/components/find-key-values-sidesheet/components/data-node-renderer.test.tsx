import { renderNode } from './data-node-renderer';
import { DataNode, FieldType } from '../types';

describe('renderNode', () => {
    it('does not throw for valid DataNode variants', () => {
        const nodes: DataNode[] = [
            {
                type: FieldType.field,
                label: 'Label',
                value: 'Value',
                link: undefined,
                toolTip: undefined,
                isPII: false,
            },
            {
                type: FieldType.section,
                label: 'Section',
                tags: [],
                isPIILabel: false,
                children: [],
            },
            {
                type: FieldType.group,
                children: [],
            },
        ];

        expect(() => {
            nodes.forEach((node, index) => {
                renderNode(node, index);
            });
        }).not.toThrow();
    });
});
