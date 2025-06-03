import { FileUploader, Modal } from '@openfun/cunningham-react';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Box } from '@/components';
import { useFileDragDrop } from '@/docs/doc-import/components/DocImportDragDrop';

type FileEvent = { target: { value: File[] } };

type DocImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (event: FileEvent) => void;
  uploadState?: 'uploading' | 'error' | 'success';
};

const FadeModal = styled(Modal)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 3s ease-in-out;
  transform: scale(1.5);
  transform-origin: center;
  width: 150%;
  height: 150%;
`;

export const DocImportUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  uploadState,
}: DocImportModalProps) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop } = useFileDragDrop((file: File) =>
    onUpload({ target: { value: [file] } })
  );

  if (!visible) {
    return null;
  }

  return (
    <FadeModal
      isOpen={visible}
      onClose={() => {
        onClose();
        setVisible(false);
      }}
      closeOnClickOutside
      title={t('Import files')}
      visible={visible}
    >
      <Box
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $css={
          isDragActive
            ? css`
                border: 2px dashed var(--c--theme--colors--primary-600);
                background-color: var(--c--theme--colors--greyscale-050);
              `
            : undefined
        }
      >
        <FileUploader
          width="100%"
          height="100%"
          text={t('Import an existing Microsoft Word file as a document')}
          multiple
          accept=".docx"
          onFilesChange={onUpload}
          state={uploadState}
        />
      </Box>
    </FadeModal>
  );
};
