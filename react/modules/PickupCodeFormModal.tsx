import type { useModalState } from '@vtex/admin-ui'
import {
  Button,
  csx,
  Flex,
  Modal,
  ModalContent,
  ModalDismiss,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  TextInput,
  useToast,
} from '@vtex/admin-ui'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'

import type { PickupCodeRecord } from '../../node/types/pickupCodes'
import { FIELD_LENGTH } from '../../node/utils/constants'
import { createPickupCode, errorMessage, updatePickupCode } from '../utils/pickupCodesApi'

interface Props {
  /** Modal state from useModalState, owned by the page */
  state: ReturnType<typeof useModalState>
  /** Record being edited; null means create mode */
  editing: PickupCodeRecord | null
  onSaved: () => void
}

const messages = defineMessages({
  createTitle: { id: 'admin/my-orders-app.form.createTitle' },
  editTitle: { id: 'admin/my-orders-app.form.editTitle' },
  orderId: { id: 'admin/my-orders-app.form.orderId' },
  pickupCode: { id: 'admin/my-orders-app.form.pickupCode' },
  required: { id: 'admin/my-orders-app.form.required' },
  cancel: { id: 'admin/my-orders-app.form.cancel' },
  save: { id: 'admin/my-orders-app.form.save' },
})

export function PickupCodeFormModal({ state, editing, onSaved }: Props) {
  const { formatMessage } = useIntl()
  const showToast = useToast()

  const [orderId, setOrderId] = useState('')
  const [pickupCode, setPickupCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!state.open) return

    setOrderId(editing?.orderId ?? '')
    setPickupCode(editing?.pickupCode ?? '')
  }, [state.open, editing])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedOrderId = orderId.trim()
    const trimmedPickupCode = pickupCode.trim()

    if (!trimmedOrderId || !trimmedPickupCode) {
      showToast({ message: formatMessage(messages.required), variant: 'critical' })

      return
    }

    setSaving(true)

    try {
      const response = editing
        ? await updatePickupCode({ id: editing.id, orderId: trimmedOrderId, pickupCode: trimmedPickupCode })
        : await createPickupCode({ orderId: trimmedOrderId, pickupCode: trimmedPickupCode })

      showToast({ message: response.message, variant: 'positive' })
      state.hide()
      onSaved()
    } catch (err) {
      showToast({ message: errorMessage(err), variant: 'critical' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal state={state}>
      <ModalHeader>
        <ModalTitle>{formatMessage(editing ? messages.editTitle : messages.createTitle)}</ModalTitle>
        <ModalDismiss />
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent>
          <Flex direction="column" className={csx({ gap: '$space-4' })}>
            <TextInput
              label={formatMessage(messages.orderId)}
              value={orderId}
              maxLength={FIELD_LENGTH}
              onChange={(event) => setOrderId(event.target.value)}
            />

            <TextInput
              label={formatMessage(messages.pickupCode)}
              value={pickupCode}
              maxLength={FIELD_LENGTH}
              onChange={(event) => setPickupCode(event.target.value)}
            />
          </Flex>
        </ModalContent>

        <ModalFooter>
          <Button variant="secondary" onClick={() => state.hide()} disabled={saving}>
            {formatMessage(messages.cancel)}
          </Button>

          <Button type="submit" loading={saving}>
            {formatMessage(messages.save)}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
