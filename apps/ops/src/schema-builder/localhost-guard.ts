/** Matches Confluence: Schema Builder only on local dev host. */
export function isLocalhostHost(host: string | undefined): boolean {
    if (!host) return false;
    const h = host.split(':')[0]?.toLowerCase() ?? '';
    return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}
