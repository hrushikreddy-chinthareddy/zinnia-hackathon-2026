import { AssignedTask } from '@deps/models/case/task-instance';
import { IdentifierInstance } from '@zinnia/api-types/types/case';

export const collectAvailableKeys = (rows: any[]): Set<string> => {
    const keys = new Set<string>();
    for (const r of rows) {
        if (!r) continue;
        Object.keys(r).forEach((k) => keys.add(k));
    }
    return keys;
};

export const taskHasAnyIdentifier = (task: AssignedTask, names: string[]) =>
    Array.isArray(task?.identifiers) &&
    task.identifiers.some((id: IdentifierInstance) =>
        names.includes(id?.identifier as string)
    );

export const getIdentifierValue = (
    task: any,
    names: string[]
): string | undefined => {
    const hit = Array.isArray(task?.identifiers)
        ? task.identifiers.find((i: any) => names.includes(i?.identifier))
        : undefined;
    return hit?.value;
};

export const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
};
