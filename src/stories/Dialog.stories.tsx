import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Typography from '@mui/joy/Typography'
import React from 'react'
import { autoOpenModal, dialog } from '../dialog'

const Dialog = autoOpenModal(Modal as any)

const dialogConfirm = async () => {
  return new Promise<boolean | null>(resolve => {
    const ref = dialog(
      <Dialog>
        <ModalDialog
          aria-labelledby="nested-modal-title"
          aria-describedby="nested-modal-description"
          sx={theme => ({
            [theme.breakpoints.only('xs')]: {
              top: 'unset',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: 0,
              transform: 'none',
              maxWidth: 'unset',
            },
          })}
        >
          <Typography id="nested-modal-title" level="h2">
            Are you absolutely sure?
          </Typography>
          <Typography id="nested-modal-description" textColor="text.tertiary">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row-reverse' },
            }}
          >
            <Button
              variant="solid"
              color="primary"
              onClick={() => {
                resolve(true)
                ref.current?.close()
              }}
            >
              Continue
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                resolve(null)
                ref.current?.close()
              }}
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Dialog>,
    )
  })
}

export const DialogConfirmButton = () => {
  return (
    <DynamicCreateElementContainer>
      <Button
        onClick={() => {
          dialogConfirm().then(result => {
            console.log(result)
          })
        }}
      >
        Show Dialog
      </Button>
    </DynamicCreateElementContainer>
  )
}

import type { Meta, StoryObj } from '@storybook/react'
import { DynamicCreateElementContainer } from '../dynamic'

const meta: Meta<typeof DialogConfirmButton> = {
  component: DialogConfirmButton,
}

export default meta
type Story = StoryObj<typeof DialogConfirmButton>
