import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import React, { Fragment, useRef, useEffect } from "react"

import { ModalProvider, useModal } from "@lib/context/modal-context"
import X from "@modules/common/icons/x"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  search?: boolean
  children: React.ReactNode
  'data-testid'?: string
  /**
   * Custom className for the modal panel (for dropdown positioning)
   */
  panelClassName?: string
  /**
   * If true, disables the backdrop overlay (for dropdown modals)
   */
  disableBackdrop?: boolean
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  search = false,
  children,
  'data-testid': dataTestId,
  panelClassName = "",
  disableBackdrop = false,
}: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        {/* No backdrop or blur for search modals */}
        {/* For search modals, use absolute positioning for dropdown effect below nav */}
        <div className={search ? "absolute left-0 top-16 w-full flex justify-start z-50" : "fixed inset-0 overflow-y-hidden"}>
          <div
            className={clx(
              search
                ? "justify-start items-start w-auto"
                : "flex min-h-full h-full justify-center p-4 text-center items-center",
              "flex"
            )}
            style={search ? { position: "absolute", left: 0, top: 0 } : {}}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                data-testid={dataTestId}
                className={clx(
                  "flex flex-col justify-start w-full transform p-5 text-left align-middle transition-all",
                  {
                    "max-w-md": size === "small",
                    "max-w-xl": size === "medium",
                    "max-w-4xl max-h-[688px] h-[688px] lg:block": size === "large", // 1000x688 (max-w-4xl is ~896px, closer to 1000)
                    "!max-w-full !max-h-full !h-screen !w-screen !p-0 xsmall:!max-w-full xsmall:!max-h-full xsmall:!h-screen xsmall:!w-screen xsmall:!p-0 lg:!max-w-4xl lg:!max-h-[688px] lg:!h-[688px] lg:!p-5": size === "large",
                    // For search modals, sharp and rectangular, no shadow, no border-radius
                    "bg-white": search,
                    "bg-white shadow-xl border rounded-rounded": !search,
                  },
                  search && "!rounded-none !shadow-none !border-none p-0",
                  panelClassName
                )}
              >
                <ModalProvider close={close}>{children}</ModalProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal()

  return (
    <Dialog.Title className="flex items-center justify-between">
      <div className="text-large-semi">{children}</div>
      <div>
        <button onClick={close} data-testid="close-modal-button">
          <X size={20} />
        </button>
      </div>
    </Dialog.Title>
  )
}

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog.Description className="flex text-small-regular text-ui-fg-base items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex justify-center h-full w-full">{children}</div>
}

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex items-center justify-end gap-x-4">{children}</div>
}

Modal.Title = Title
Modal.Description = Description
Modal.Body = Body
Modal.Footer = Footer

export default Modal
