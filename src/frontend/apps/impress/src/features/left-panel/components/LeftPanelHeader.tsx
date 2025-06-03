import { Button } from '@openfun/cunningham-react';
import { t } from 'i18next';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { Box, DropdownMenu, Icon, SeparatedSection } from '@/components';
import { useCreateDoc } from '@/docs/doc-management';
import { DocSearchModal } from '@/docs/doc-search';
import { useAuth } from '@/features/auth';
import { useImportDoc } from '@/features/docs/doc-management/api/useImportDoc';
import { DocImportUploadModal } from '@/features/left-panel/components/DocImportUploadModal';
import { useCmdK } from '@/hook/useCmdK';

import { useLeftPanelStore } from '../stores';

export const LeftPanelHeader = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { authenticated } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isImportFilesModalOpen, setIsImportFilesModalOpen] = useState(false);

  const openSearchModal = useCallback(() => {
    const isEditorToolbarOpen =
      document.getElementsByClassName('bn-formatting-toolbar').length > 0;
    if (isEditorToolbarOpen) {
      return;
    }

    setIsSearchModalOpen(true);
  }, []);

  const closeSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  useCmdK(openSearchModal);
  const { togglePanel } = useLeftPanelStore();

  const { mutate: createDoc, isPending: isCreatingDoc } = useCreateDoc({
    onSuccess: (doc) => {
      router.push(`/docs/${doc.id}`);
      togglePanel();
    },
  });

  const { mutate: importDoc, status: importDocStatus } = useImportDoc({
    onSuccess: (doc) => {
      router.push(`/docs/${doc.id}`);
      togglePanel();
    },
  });

  const uploadDocImportStatus: undefined | 'uploading' | 'error' | 'success' =
    useMemo(() => {
      if (importDocStatus === 'idle') {
        return undefined;
      }

      if (importDocStatus === 'pending') {
        return 'uploading';
      }

      return importDocStatus;
    }, [importDocStatus]);

  const goToHome = () => {
    router.push('/');
    togglePanel();
  };

  const createNewDoc = () => {
    createDoc();
  };

  const handleImportFilesystem = () => {
    const fileInput = document.querySelector<HTMLInputElement>(
      '.--docs--left-panel-header input[type="file"]',
    );
    if (fileInput) {
      fileInput.onchange = uploadChanged;
      fileInput.click();
    }
  };

  const handleImportNotion = () => {
    // TODO: open import from Notion
  };

  const handleImportFiles = () => {
    setIsImportFilesModalOpen(true);
  };

  type FileEvent = { target: { value: File[] } };

  const uploadChanged = (event: FileEvent) => {
    const file = event.target.value[0];

    if (!file) {
      return;
    }

    importDoc(file);
    setIsImportFilesModalOpen(false);
  };

  return (
    <>
      <Box $width="100%" className="--docs--left-panel-header">
        <input
          type="file"
          accept=".docx"
          style={{ display: 'none' }}
          onChange={uploadChanged}
        />
        <SeparatedSection>
          <Box
            $padding={{ horizontal: 'sm' }}
            $width="100%"
            $direction="row"
            $justify="space-between"
            $align="center"
          >
            <Box $direction="row" $gap="2px">
              <Button
                onClick={goToHome}
                size="medium"
                color="tertiary-text"
                icon={
                  <Icon $variation="800" $theme="primary" iconName="house" />
                }
              />
              {authenticated && (
                <Button
                  onClick={openSearchModal}
                  size="medium"
                  color="tertiary-text"
                  icon={
                    <Icon $variation="800" $theme="primary" iconName="search" />
                  }
                />
              )}
            </Box>
            {authenticated && (
              <>
                <Button tabIndex={0} onClick={createNewDoc} disabled={isCreatingDoc}>
                  {t('New doc')}
                </Button>
                <DropdownMenu
                  showArrow={false}
                  disabled={isCreatingDoc}
                  options={[
                    { label: t('From your computer'), disabled: true },
                    { label: t('Open file...'), callback: handleImportFilesystem, padding: { vertical: 'xs', horizontal: 'md' } },
                    { label: t('Import files...'), callback: handleImportFiles, padding: { vertical: 'xs', horizontal: 'md' } },
                    { label: t('From connected apps'), disabled: true },
                    { label: t('Import from Notion'), callback: handleImportNotion, padding: { vertical: 'xs', horizontal: 'md' } },
                  ]}
                >
                  <Button aria-label="Button with only an icon"
                    color="primary" style={{width: "22px"}}
                    icon={<span className="material-icons">arrow_drop_down</span>}
                    role="button" disabled={isCreatingDoc}
                  />
                </DropdownMenu>
              </>
            )}
          </Box>
        </SeparatedSection>
        {children}
      </Box>
      {isSearchModalOpen && (
        <DocSearchModal onClose={closeSearchModal} isOpen={isSearchModalOpen} />
      )}
      <DocImportUploadModal
        isOpen={isImportFilesModalOpen}
        onClose={() => setIsImportFilesModalOpen(false)}
        onUpload={uploadChanged}
        uploadState={uploadDocImportStatus}
      />
    </>
  );
};
