import { Alert, VariantType, Modal, ModalSize } from '@openfun/cunningham-react';
import { t } from 'i18next';

import { Box } from '@/components';

export interface ImportReportEntry {
  id: number;
  source_uri: string;
  source_reference?: string;
  destination_uri?: string;
  destination_reference?: string;
  severity: 'WARNING' | 'ERROR';
  scope: 'BLOCK' | 'DOCUMENT';
  action: 'SKIPPED' | 'STRUCTURAL_CHANGE';
  action_code: number;
  message?: string;
}

export interface ImportReport {
  entries: ImportReportEntry[];
}

export interface ImportReportProps {
  migrationReport: ImportReport;
  onClose: () => void;
}

export const exampleReport: ImportReport = {
  entries: [
    {
      id: 1,
      source_uri: 'file://myDoc1.docx',
      destination_uri: 'https://localhost/docs/doc1',
      severity: 'WARNING',
      scope: 'BLOCK',
      action: 'STRUCTURAL_CHANGE',
      action_code: 123,
      source_reference: 'block1',
      destination_reference: 'block1',
    },
    {
      id: 2,
      source_uri: 'file://myDoc2.docx',
      destination_uri: 'https://localhost/docs/doc1',
      severity: 'ERROR',
      scope: 'BLOCK',
      action: 'SKIPPED',
      action_code: 129,
      message: "Block type 'table' not supported by destination",
      source_reference: 'block1',
    },
    {
      id: 3,
      source_uri: 'file://myDoc3.docx',
      severity: 'ERROR',
      scope: 'DOCUMENT',
      action: 'SKIPPED',
      action_code: 125,
    },
  ],
};

export const DocImportReportModal = ({
  migrationReport,
  onClose,
}: ImportReportProps) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      closeOnClickOutside
      size={ModalSize.LARGE}
    >
      <Box $align="left" $width="100%" $maxWidth="600px" $margin="auto">
      {migrationReport.entries.map((entry: ImportReportEntry) => {
        return (
          <Box key={entry.id} $margin={{ vertical: '0.5rem' }}>
            <Alert
              type={
                entry.severity == 'WARNING'
                    ? VariantType.WARNING
                  : VariantType.ERROR
              }
              additional={entry.message}
            >
              <p>
                {t('From')} {entry.source_uri}
                {entry.source_reference && ' (' + entry.source_reference + ')'}
                {entry.destination_uri && t('to') + entry.destination_uri}
                {entry.destination_reference &&
                  ' (' + entry.destination_reference + ')'}
                <br />
                {t('Scope')} {entry.scope} {t('and action')} {entry.action} (
                {entry.action_code})
              </p>
            </Alert>
          </Box>
        );
      })}
    </Box>
    </Modal>
  );
};
