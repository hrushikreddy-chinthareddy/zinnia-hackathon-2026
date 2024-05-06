import { NextURL } from 'next/dist/server/web/next-url';

export type Index<T> = {
  [key: string]: T;
};

export type PartialNextUrl = Pick<NextURL, 'href' | 'hostname' | 'pathname'>;
