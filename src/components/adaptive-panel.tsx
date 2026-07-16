import type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerRootProps,
  DrawerTriggerProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@base-ui/react'
import type { PopoverCloseProps, Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { ReactNode } from 'react'
import type { Button } from './ui/button'
import { PopoverClose } from '@base-ui/react/popover'
import { createContext, use, useState } from 'react'
import { useIsMobile } from '#lib/hooks'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from './ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface AdaptiveProps<TDrawerProps, TPopoverProps> {
  drawer?: TDrawerProps
  popover?: TPopoverProps
  children?: ReactNode
}

const IsMobileContext = createContext(false)

const IsOpenContext = createContext<{
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

/**
 *  renders either a popover or a drawer depending on the screen width
 */
export function AdaptivePanel({
  children,
  drawer,
  popover,
}: AdaptiveProps<DrawerRootProps, PopoverRootProps>) {
  const isMobile = useIsMobile()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <IsOpenContext value={{ isOpen, setIsOpen }}>
      <IsMobileContext value={isMobile}>
        {isMobile
          ? <Drawer {...drawer}>{children}</Drawer>
          : <Popover {...popover}>{children}</Popover>}
      </IsMobileContext>
    </IsOpenContext>
  )
}

export function AdaptivePanelTrigger({
  children,
  drawer,
  popover,
}: AdaptiveProps<DrawerTriggerProps, PopoverTriggerProps>) {
  const isMobile = use(IsMobileContext)

  return isMobile
    ? <DrawerTrigger {...drawer}>{children}</DrawerTrigger>
    : <PopoverTrigger {...popover}>{children}</PopoverTrigger>
}

export function AdaptivePanelContent({
  children,
  drawer,
  popover,
}: AdaptiveProps<DrawerContentProps, PopoverPrimitive.Popup.Props
& Pick<
  PopoverPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
>>) {
  const isMobile = use(IsMobileContext)

  return isMobile
    ? (
        <DrawerContent {...drawer}>
          <div className="p-4 flex flex-col gap-4">
            {children}
          </div>
        </DrawerContent>
      )
    : (
        <PopoverContent {...popover}>
          {children}
        </PopoverContent>
      )
}

export function AdaptivePanelClose({
  children: Children,
  drawer,
  popover,
}: AdaptiveProps<DrawerCloseProps, PopoverCloseProps> & {
  children: typeof Button
}) {
  const isMobile = use(IsMobileContext)
  const { isOpen, setIsOpen } = use(IsOpenContext)

  return <Children onClick={setIsOpen} />

  // return isMobile ? <DrawerClose /> : <PopoverClose />
}
