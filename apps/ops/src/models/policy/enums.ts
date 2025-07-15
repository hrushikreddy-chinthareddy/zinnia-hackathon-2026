export enum SorSystem {
    'LifeCad' = 'LifeCad',
    'Zahara' = 'Zahara',
    'Fast' = 'Fast',
}

export const SOR_MAP: Record<string, SorSystem> = {
    [SorSystem.Zahara.toLowerCase()]: SorSystem.Zahara,
    [SorSystem.Fast.toLowerCase()]: SorSystem.Fast,
};
