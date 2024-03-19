import { BreadcrumbProps } from './types';

import styles from './Breadcrumb.module.css';

export const Breadcrumb = ({ text, url }: BreadcrumbProps) => {
  if (!text || !url) {
    return null;
  }

  const formattedToSentenceCase =
    text?.charAt(0)?.toUpperCase() + text?.slice(1)?.toLowerCase();

  return (
    <a
      href={url}
      className={`typography-nav-links-sm ${styles.breadcrumb}`}
    >{`< ${formattedToSentenceCase}`}</a>
  );
};
