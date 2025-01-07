import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';

const MourningBannerText = () => {
  return (
    <p>
      In recognition of the National Day of Mourning following the death of
      former <span style={{ fontWeight: 'bold' }}>President Jimmy Carter</span>,
      the stock market will be closed on{' '}
      <span style={{ fontWeight: 'bold' }}>January 9, 2025</span>. As a result,
      contract values are as of close of business{' '}
      <span style={{ fontWeight: 'bold' }}>January 8, 2025</span>. Any trades or
      other financial transactions submitted on{' '}
      <span style={{ fontWeight: 'bold' }}>January 9, 2025</span> will be
      processed when the stock market reopens on{' '}
      <span style={{ fontWeight: 'bold' }}>January 10, 2025</span>.
    </p>
  );
};

export const MourningBanner = () => {
  const showPresidentialMourningBanner = () => {
    const today = dayjs();
    return today.isBetween('2025-01-08', '2025-01-10', 'day', '[]');
  };

  if (!showPresidentialMourningBanner()) {
    return (
      <BannerAlert
        className="mb-lg"
        bodyText={<MourningBannerText />}
        variant={BannerVariant.Information}
      />
    );
  }

  return null;
};
