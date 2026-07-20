import {
  Button,
  createColumns,
  csx,
  DataView,
  DataViewHeader,
  Flex,
  FlexSpacer,
  experimental_I18nProvider as I18nProvider,
  IconPencil,
  IconPlus,
  IconTrash,
  Modal,
  ModalContent,
  ModalDismiss,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Page,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderTitle,
  PageHeaderTop,
  Pagination,
  Search,
  Skeleton,
  Table,
  TBody,
  TBodyCell,
  TBodyRow,
  Text,
  THead,
  THeadCell,
  ThemeProvider,
  ToastProvider,
  useDataViewState,
  useModalState,
  usePaginationState,
  useSearchState,
  useTableState,
  useToast,
} from '@vtex/admin-ui'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import type { PickupCodeRecord } from '../node/types/pickupCodes'
import { PickupCodeFormModal } from './modules/PickupCodeFormModal'
import { searchField } from './styles/adminPickupCodes'
import { ITEMS_PER_PAGE } from './utils/constants'
import { deletePickupCode, errorMessage, listPickupCodes } from './utils/pickupCodesApi'

const messages = defineMessages({
  title: { id: 'admin/my-orders-app.title' },
  searchAria: { id: 'admin/my-orders-app.search.aria' },
  searchPlaceholder: { id: 'admin/my-orders-app.search.placeholder' },
  createButton: { id: 'admin/my-orders-app.create.button' },
  colOrder: { id: 'admin/my-orders-app.table.orderId' },
  colCode: { id: 'admin/my-orders-app.table.pickupCode' },
  colActions: { id: 'admin/my-orders-app.table.actions' },
  actionEdit: { id: 'admin/my-orders-app.action.edit' },
  actionDelete: { id: 'admin/my-orders-app.action.delete' },
  deleteTitle: { id: 'admin/my-orders-app.delete.title' },
  deleteText: { id: 'admin/my-orders-app.delete.text' },
  deleteCancel: { id: 'admin/my-orders-app.delete.cancel' },
  deleteConfirm: { id: 'admin/my-orders-app.delete.confirm' },
})

function PickupCodes() {
  const { formatMessage } = useIntl()
  const showToast = useToast()

  const formModal = useModalState()
  const deleteModal = useModalState()

  const dataView = useDataViewState()
  const search = useSearchState({ timeout: 500 })

  /** total lives in the hook's internal reducer: it only reads the param at mount, updates go through paginate({ type: 'setTotal' }) */
  const pagination = usePaginationState({ pageSize: ITEMS_PER_PAGE, total: 0 })

  const [items, setItems] = useState<PickupCodeRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeRecord, setActiveRecord] = useState<PickupCodeRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((key) => key + 1)

  useEffect(() => {
    let cancelled = false

    setLoading(true)

    listPickupCodes({
      page: pagination.currentPage,
      pageSize: ITEMS_PER_PAGE,
      search: search.debouncedValue || undefined,
    })
      .then((response) => {
        if (cancelled) return

        setItems(response.data.list)
        setTotal(response.data.pagination.total)
        setError(false)
      })
      .catch(() => {
        if (cancelled) return

        setError(true)
      })
      .finally(() => {
        if (cancelled) return

        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, search.debouncedValue, refreshKey])

  useEffect(() => {
    pagination.paginate({ type: 'setTotal', total })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  const hasFilters = Boolean(search.debouncedValue)

  useEffect(() => {
    if (loading) {
      dataView.setStatus({ type: 'loading' })
    } else if (error) {
      dataView.setStatus({ type: 'error' })
    } else if (!items.length) {
      dataView.setStatus({ type: hasFilters ? 'not-found' : 'empty' })
    } else {
      dataView.setStatus({ type: 'ready' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, items.length, hasFilters])

  const openCreate = () => {
    setActiveRecord(null)
    formModal.show()
  }

  const openEdit = (record: PickupCodeRecord) => {
    setActiveRecord(record)
    formModal.show()
  }

  const openDelete = (record: PickupCodeRecord) => {
    setActiveRecord(record)
    deleteModal.show()
  }

  const handleDelete = async () => {
    if (!activeRecord) return

    setDeleting(true)

    try {
      const response = await deletePickupCode(activeRecord.id)

      showToast({ message: response.message, variant: 'positive' })
      deleteModal.hide()
      refresh()
    } catch (err) {
      showToast({ message: errorMessage(err), variant: 'critical' })
    } finally {
      setDeleting(false)
    }
  }

  const columns = createColumns<PickupCodeRecord>([
    { id: 'orderId', header: formatMessage(messages.colOrder) },
    { id: 'pickupCode', header: formatMessage(messages.colCode) },
    {
      id: 'id',
      header: formatMessage(messages.colActions),
      resolver: {
        type: 'root',
        render: ({ item, context: status }) => {
          if (status === 'loading') {
            return <Skeleton className={csx({ height: '1.25rem' })} />
          }

          return (
            <Flex direction="row" className={csx({ gap: '$space-2' })}>
              <Button
                variant="tertiary"
                icon={<IconPencil />}
                aria-label={formatMessage(messages.actionEdit)}
                onClick={() => openEdit(item)}
              />

              <Button
                variant="criticalTertiary"
                icon={<IconTrash />}
                aria-label={formatMessage(messages.actionDelete)}
                onClick={() => openDelete(item)}
              />
            </Flex>
          )
        },
      },
    },
  ])

  const {
    data: tableRows,
    getBodyCell,
    getHeadCell,
    getTable,
  } = useTableState({
    columns,
    items,
    status: dataView.status,
    length: ITEMS_PER_PAGE,
  })

  return (
    <Page>
      <PageHeader>
        <PageHeaderTop>
          <PageHeaderTitle>{formatMessage(messages.title)}</PageHeaderTitle>

          <PageHeaderActions>
            <Button icon={<IconPlus />} onClick={openCreate}>
              {formatMessage(messages.createButton)}
            </Button>
          </PageHeaderActions>
        </PageHeaderTop>
      </PageHeader>

      <PageContent layout="wide">
        <DataView state={dataView}>
          <DataViewHeader>
            <Flex direction="row" align="center" className={csx({ gap: '$space-3', width: '100%' })}>
              <div className={searchField}>
                <Search
                  {...search.getInputProps()}
                  aria-label={formatMessage(messages.searchAria)}
                  placeholder={formatMessage(messages.searchPlaceholder)}
                />
              </div>

              <FlexSpacer />

              <Pagination state={pagination} loading={loading} />
            </Flex>
          </DataViewHeader>

          <Table {...getTable()} className={csx({ width: '100%' })}>
            <THead>
              {columns.map((column) => (
                <THeadCell {...getHeadCell(column)} key={column.id} />
              ))}
            </THead>

            <TBody>
              {tableRows.map((item) => (
                <TBodyRow key={item.id}>
                  {columns.map((column) => (
                    <TBodyCell {...getBodyCell(column, item)} key={column.id} />
                  ))}
                </TBodyRow>
              ))}
            </TBody>
          </Table>
        </DataView>

        <PickupCodeFormModal state={formModal} editing={activeRecord} onSaved={refresh} />

        <Modal state={deleteModal}>
          <ModalHeader>
            <ModalTitle>{formatMessage(messages.deleteTitle)}</ModalTitle>
            <ModalDismiss />
          </ModalHeader>

          <ModalContent>
            <Text>{formatMessage(messages.deleteText, { orderId: activeRecord?.orderId ?? '' })}</Text>
          </ModalContent>

          <ModalFooter>
            <Button variant="secondary" onClick={() => deleteModal.hide()} disabled={deleting}>
              {formatMessage(messages.deleteCancel)}
            </Button>

            <Button variant="critical" loading={deleting} onClick={handleDelete}>
              {formatMessage(messages.deleteConfirm)}
            </Button>
          </ModalFooter>
        </Modal>
      </PageContent>
    </Page>
  )
}

function AdminPickupCodes() {
  const {
    culture: { locale },
  } = useRuntime()

  return (
    <ThemeProvider>
      <I18nProvider locale={locale}>
        <ToastProvider>
          <PickupCodes />
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default AdminPickupCodes
