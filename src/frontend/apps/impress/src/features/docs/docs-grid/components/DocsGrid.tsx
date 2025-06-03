import {
  Button,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { css } from 'styled-components';

import { Box, Card, Text } from '@/components';
import { DocDefaultFilter, useInfiniteDocs } from '@/docs/doc-management';
import { useImportDoc } from '@/features/docs/doc-management/api/useImportDoc';
import {
  DocImportReportModal,
  exampleReport,
} from '@/features/left-panel/components/DocImportReportModal';
import { useResponsiveStore } from '@/stores';

import { useResponsiveDocGrid } from '../hooks/useResponsiveDocGrid';

import { DocsGridItem } from './DocsGridItem';
import { DocsGridLoader } from './DocsGridLoader';

type DocsGridProps = {
  target?: DocDefaultFilter;
};
export const DocsGrid = ({
  target = DocDefaultFilter.ALL_DOCS,
}: DocsGridProps) => {
  const { t } = useTranslation();

  const { isDesktop } = useResponsiveStore();
  const { mutate: importDoc } = useImportDoc({ onSuccess: () => {} });
  const { toast } = useToastProvider();
  const [isDragActive, setIsDragActive] = useState(false);
  const [highlightedDocId, setHighlightedDocId] = useState<string | null>(null);
  const [isErrorReportOpen, setIsErrorReportOpen] = useState(false);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.docx')) {
      importDoc(file, {
        onSuccess: (doc) => {
          setHighlightedDocId(doc.id);
          toast(t('Import completed'), VariantType.SUCCESS, { duration: 5000 });
          setTimeout(() => setHighlightedDocId(null), 5000);
        },
        onError: (error) => {
          toast(`${t('The import failed...')}`, VariantType.ERROR, {
            duration: 10000,
            primaryLabel: t('Show report'),
            primaryOnClick: () => setIsErrorReportOpen(true),
          });
        },
      });
    }
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const { flexLeft, flexRight } = useResponsiveDocGrid();

  const {
    data,
    isFetching,
    isRefetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteDocs({
    page: 1,
    ...(target &&
      target !== DocDefaultFilter.ALL_DOCS && {
        is_creator_me: target === DocDefaultFilter.MY_DOCS,
      }),
  });
  const loading = isFetching || isLoading;
  const hasDocs = data?.pages.some((page) => page.results.length > 0);
  const loadMore = (inView: boolean) => {
    if (!inView || loading) {
      return;
    }
    void fetchNextPage();
  };

  const title =
    target === DocDefaultFilter.MY_DOCS
      ? t('My docs')
      : target === DocDefaultFilter.SHARED_WITH_ME
        ? t('Shared with me')
        : t('All docs');

  return (
    <Box
      $position="relative"
      $width="100%"
      $maxWidth="960px"
      $maxHeight="calc(100vh - 52px - 2rem)"
      $align="center"
      className="--docs--doc-grid"
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
      <DocsGridLoader isLoading={isRefetching || loading} />
      <Card
        role="grid"
        data-testid="docs-grid"
        $height="100%"
        $width="100%"
        $css={css`
          ${!isDesktop ? 'border: none;' : ''}
        `}
        $padding={{
          top: 'base',
          horizontal: isDesktop ? 'md' : 'xs',
          bottom: 'md',
        }}
      >
        <Text
          as="h4"
          $size="h4"
          $variation="1000"
          $margin={{ top: '0px', bottom: '10px' }}
        >
          {title}
        </Text>

        {!hasDocs && !loading && (
          <Box $padding={{ vertical: 'sm' }} $align="center" $justify="center">
            <Text $size="sm" $variation="600" $weight="700">
              {t('No documents found')}
            </Text>
          </Box>
        )}
        {hasDocs && (
          <Box $gap="6px" $overflow="auto">
            <Box
              $direction="row"
              $padding={{ horizontal: 'xs' }}
              $gap="10px"
              data-testid="docs-grid-header"
            >
              <Box $flex={flexLeft} $padding="3xs">
                <Text $size="xs" $variation="600" $weight="500">
                  {t('Name')}
                </Text>
              </Box>
              {isDesktop && (
                <Box $flex={flexRight} $padding={{ vertical: '3xs' }}>
                  <Text $size="xs" $weight="500" $variation="600">
                    {t('Updated at')}
                  </Text>
                </Box>
              )}
            </Box>

            {data?.pages.map((currentPage) => {
              return currentPage.results.map((doc) => (
                <Box
                  key={doc.id}
                  className={
                    doc.id === highlightedDocId
                      ? '--docs--item--highlighted'
                      : '--docs--item--visible'
                  }
                >
                  <DocsGridItem doc={doc} />
                </Box>
              ));
            })}

            {hasNextPage && !loading && (
              <InView
                data-testid="infinite-scroll-trigger"
                as="div"
                onChange={loadMore}
              >
                {!isFetching && hasNextPage && (
                  <Button
                    onClick={() => void fetchNextPage()}
                    color="primary-text"
                  >
                    {t('More docs')}
                  </Button>
                )}
              </InView>
            )}
          </Box>
        )}
      </Card>
      {isErrorReportOpen && (
        <DocImportReportModal
          migrationReport={exampleReport}
          onClose={() => setIsErrorReportOpen(false)}
        />
      )}
    </Box>
  );
};
