import { DataNode, FieldType, DataSection, DataField } from '../types';
import { isDataField, isDataSection, isDataSectionOrField } from './predicates';

/**
 * Find a node by either matching a numeric index into the group-of-groups
 * or matching a string key to a label in a sub-group
 *
 * @param node - node to search
 * @param key - key to match
 * @returns node if found, undefined otherwise
 */
export function findInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): DataNode | undefined {
    if (node == null || (node.type === FieldType.field && node.label === key)) {
        return node;
    } else if (node.type === FieldType.section) {
        return findInNodes({
            nodes: node.children,
            key,
        });
    } else if (node.type === FieldType.group) {
        return findInGroup({
            nodes: node.children,
            key,
        });
    }
}

/**
 * Find a node in a group by either matching a numeric index into the group-of-groups
 * or matching a string key to a label in a sub-group
 *
 * @param nodes - nodes to search
 * @param key - key to match
 * @returns node if found, undefined otherwise
 */
export function findInGroup({
    nodes,
    key,
}: {
    nodes: DataNode[][];
    key: string;
}): DataNode | undefined {
    const pathFragments = key.split('.');
    const [firstFragment, ...rest] = pathFragments;

    // Case 1: numeric index into the group-of-groups
    if (!isNaN(Number(firstFragment))) {
        const index = Number(firstFragment);
        const firstNodeOrNodes = nodes[index];

        if (!firstNodeOrNodes) {
            return undefined;
        }

        if (rest.length) {
            return findInNodes({
                nodes: firstNodeOrNodes,
                key: rest.join('.'),
            });
        }

        //TODO: future provision, return list of nodes
    }

    // Case 2: non-numeric – search each inner array for the first match by label
    for (const innerNodes of nodes) {
        const candidate = findInNodes({
            nodes: innerNodes,
            key, // whole key, so findInNodes will handle rest of path
        });

        if (candidate !== undefined) {
            return candidate;
        }
    }
}

/**
 * Find a node in a list of DataNode's by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param nodes - nodes to search
 * @param key - key to match
 * @returns node if found, undefined otherwise
 */
export function findInNodes({
    nodes,
    key,
}: {
    nodes: DataNode[];
    key: string;
}): DataNode | undefined {
    const pathFragments = key.split('.');
    const [firstFragment, ...rest] = pathFragments;
    const firstNode = !isNaN(Number(firstFragment))
        ? nodes[Number(firstFragment)]
        : nodes
              .filter(isDataSectionOrField)
              .find((child) => child.label === firstFragment);

    if (rest.length) {
        if (firstNode) {
            return findInNode({ node: firstNode, key: rest.join('.') });
        }
    } else {
        return firstNode;
    }
}

/**
 * Find a section in a node by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param node - node to search
 * @param key - key to match
 * @returns section if found, undefined otherwise
 */
export function findSectionInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): DataSection | undefined {
    const foundNode = findInNode({ node, key });
    if (foundNode && isDataSection(foundNode)) {
        return foundNode;
    }
}

/**
 * Find a section in a list of DataNode's by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param nodes - nodes to search
 * @param key - key to match
 * @returns section if found, undefined otherwise
 */
export function findSectionInNodes({
    nodes,
    key,
}: {
    nodes: DataNode[];
    key: string;
}): DataSection | undefined {
    const foundNode = findInNodes({ nodes, key });
    if (foundNode && isDataSection(foundNode)) {
        return foundNode;
    }
}

/**
 * Find a field in a node by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param node - node to search
 * @param key - key to match
 * @returns field if found, undefined otherwise
 */
export function findFieldInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): DataField | undefined {
    const foundNode = findInNode({ node, key });
    if (foundNode && isDataField(foundNode)) {
        return foundNode;
    }
}

/**
 * Find a field in a list of DataNode's by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param nodes - nodes to search
 * @param key - key to match
 * @returns field if found, undefined otherwise
 */
export function findFieldInNodes({
    nodes,
    key,
}: {
    nodes: DataNode[];
    key: string;
}): DataField | undefined {
    const foundNode = findInNodes({ nodes, key });
    if (foundNode && isDataField(foundNode)) {
        return foundNode;
    }
}

/**
 * Find a value in a node by either matching a numeric index into the list
 * or matching a string key to a label in a node
 *
 * @param node - node to search
 * @param key - key to match
 * @returns value if found, undefined otherwise
 */
export function findValueInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): string | undefined {
    const foundNode = findFieldInNode({ node, key });
    return foundNode?.value;
}

export function findValueInNodes({
    nodes,
    key,
}: {
    nodes: DataNode[];
    key: string;
}): string | undefined {
    const foundNode = findFieldInNodes({ nodes, key });
    return foundNode?.value;
}
