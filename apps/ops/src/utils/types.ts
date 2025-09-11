/**
 * This file containes helper type functions
 */

// This function determines whether a string is a key of an object
export const isObjectKey = <T extends object>(
    key: PropertyKey,
    obj: T
): key is keyof T => key in obj;

// Makes a type more readable
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {}; // eslint-disable-line @typescript-eslint/ban-types

declare const brand: unique symbol;

/*
 * Branded type constructor
 */
export type Brand<T, Brand extends string> = T & { [brand]: Brand };
