// next-i18next uses its own i18next instance in non-Next.js environments;
// delegate to react-i18next so it reads from I18nextProvider instead.
export { useTranslation } from 'react-i18next';
