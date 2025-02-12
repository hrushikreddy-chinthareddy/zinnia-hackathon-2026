'use server';

import { redirect } from 'next/navigation';

export function handleRedirection(path: string) {
  redirect(path);
}
