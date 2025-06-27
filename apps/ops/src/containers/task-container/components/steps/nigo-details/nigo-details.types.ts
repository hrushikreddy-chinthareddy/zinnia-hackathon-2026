export type SubException = {
    label: string;
    value: string;
    displayText: string;
};

export type NigoSubException = {
    nmId: string;
    subExceptions: SubException[];
};

export type NigoException = {
    label: string;
    value: string;
};

export type ExceptionSubRef = {
    subNmId: string;
    carrier: string;
    process: string;
    subProcess: string;
    subNmIdDetail: string;
};

export type NigoExceptionResponse = {
    nmId: string;
    category: string;
    reason: string;
    detailedReason: string;
    exceptionSubRefs: ExceptionSubRef[];
};
