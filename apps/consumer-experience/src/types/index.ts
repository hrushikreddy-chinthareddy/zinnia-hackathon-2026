import { NextURL } from 'next/dist/server/web/next-url';

export type Index<T> = {
  [key: string]: T;
};

export type PartialNextUrl = Pick<
  NextURL,
  'href' | 'hostname' | 'pathname' | 'search'
>;

export interface AppUrl {
  host: string | null;
  carrier: string;
  isCarrierRequest: boolean;
  domain: string | undefined;
  protocol: string;
  port: string;
  href: string;
}
