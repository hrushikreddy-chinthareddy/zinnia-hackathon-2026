/**
 * This file containes helper type functions 
 */

// This function determines whether a string is a key of an object
export const isObjectKey = <T extends object>(key: PropertyKey, obj: T): key is keyof T => key in obj