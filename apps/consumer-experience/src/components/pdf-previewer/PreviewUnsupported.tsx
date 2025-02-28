import { saveAs } from 'file-saver';

import { Footer } from '@/components/footer/Footer';

import styles from './PdfPreviewer.module.css';
import { ButtonWithAnalytics } from '../button-with-analytics/ButtonWithAnalytics';

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
        <h1 className="typography-desktop-headline-1d">Documents</h1>
        <div className={`card ${styles.cardContent}`}>
          <div>PDF Preview doesn't seem to be supported by this browser.</div>
          <div>
            <ButtonWithAnalytics onClick={saveDocument}>
              Download PDF
            </ButtonWithAnalytics>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
