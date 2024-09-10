export enum ResponsiveFlexTest {
    Container = 'responsive-flex-container-test-id',
}

export enum LayoutDirection {
    Vertical = 'flex-col',
    Horizontal = 'flex-row',
}

export enum LayoutAlignment {
    TopEvenly = 'align-top items-start justify-between',
    MiddleEvenly = 'align-middle items-center justify-between',
    BottomEvenly = 'align-bottom items-end justify-between',
    TopLeft = 'align-top items-start justify-start',
    MiddleLeft = 'align-middle items-center justify-start',
    BottomLeft = 'align-bottom items-end justify-start',
    TopMiddle = 'align-top items-start justify-center',
    Middle = 'align-middle items-center justify-center',
    BottomMiddle = 'align-bottom items-end justify-center',
    TopRight = 'align-top items-start justify-end',
    MiddleRight = 'align-middle items-center justify-end',
    BottomRight = 'align-bottom items-end justify-end',
}

export enum VerticalResizing {
    Fixed = 'min-h-0',
    Fill = 'h-full',
    Hug = 'h-max',
}

export enum HorizontalResizing {
    Fixed = 'flex min-w-0',
    Fill = 'flex w-full',
    Hug = 'inline-flex w-max',
}

export enum ItemSpacing {
    None = 'gap-0',
    XXSmall = 'gap-2',
    XSmall = 'gap-4',
    Small = 'gap-6',
    Medium = 'gap-8',
    Large = 'gap-10',
    XLarge = 'gap-16',
}

export enum ItemPadding {
    None = 'p-0',
    XSmall = 'p-4',
    Small = 'p-6',
    Medium = 'p-8',
    Large = 'p-10',
    XLarge = 'p-16',
}
