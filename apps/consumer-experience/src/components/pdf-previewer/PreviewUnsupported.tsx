import { saveAs } from 'file-saver';

import { Button } from '@/components/button/Button';
import { Footer } from '@/components/footer/Footer';

import styles from './PdfPreviewer.module.css';
import { AnalyticsPageHeader } from '../analytics/AnalyticsPageHeader';

export default function PreviewUnsupported({
  fileName,
  url,
}: {
  fileName: string;
  url: string;
}) {
  const saveDocument = () => {
    saveAs(url, `${fileName}.pdf`);
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AnalyticsPageHeader
          pageTitle={'Documents'}
          className="typography-desktop-headline-1d"
          analyticsProps={{
            documentUrl: url,
          }}
        />
        <div className={`card ${styles.cardContent}`}>
          <div>PDF Preview doesn't seem to be supported by this browser.</div>
          <div>
            <Button onClick={saveDocument}>Download PDF</Button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
