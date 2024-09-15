import {
  type FC,
  type FunctionComponentElement,
  type ReactNode,
  type Ref,
  cloneElement,
  createElement,
  createRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { dynamicCreateElement } from './dynamic'
import { sleep } from './util'

export interface ModalInstance {
  close(): Promise<void>
}

export interface AutoOpenModelOptions {
  dismissTransitionDuration?: number
}

export interface AutoOpenModelProps {
  modalRef?: Ref<ModalInstance>
  onClose?: () => void
  afterClose?: () => void | PromiseLike<void>
  children?: ReactNode
}

export const autoOpenModal = <
  P extends {
    children?: ReactNode
    open: boolean
    onClose?: () => void
  },
>(
  DialogComponent: FC<P>,
  options: AutoOpenModelOptions = {},
) => {
  type Props = Omit<P, 'open'> & AutoOpenModelProps

  const { dismissTransitionDuration = 225 } = options

  function AutoOpenModal({
    children,
    onClose = () => {},
    afterClose = () => {},
    modalRef,
    ...props
  }: Props) {
    const [open, setOpen] = useState(true)

    const close = useCallback(async () => {
      setOpen(false)
      await sleep(dismissTransitionDuration)
      await afterClose()
    }, [afterClose])

    useImperativeHandle(
      modalRef,
      () => {
        return {
          close,
        }
      },
      [close],
    )

    return createElement(
      DialogComponent,
      {
        open,
        onClose: () => {
          onClose()
          close()
        },
        ...props,
      } as P,
      children,
    )
  }

  return AutoOpenModal
}

export const dialog = <
  P extends AutoOpenModelProps,
  T extends FunctionComponentElement<P>,
>(
  element: T,
) => {
  const ref = createRef<ModalInstance>()

  const el = cloneElement<P>(
    element,
    {
      modalRef: ref,
      afterClose: async () => {
        await element.props.afterClose?.()
        dismiss()
      },
      ...element.props,
    },
    element.props.children,
  )

  const dismiss = dynamicCreateElement(el)

  return ref
}
