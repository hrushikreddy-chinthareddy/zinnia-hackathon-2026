import { Button } from '@zinnia/bloom/internal/components';
import { saveAs } from 'file-saver';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';

import styles from './PdfPreviewer.module.css';

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
        <HeaderBreadcrumb title="Documents" />
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
