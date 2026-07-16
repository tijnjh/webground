import type {
  DrawerContentProps,
  DrawerRootProps,
  DrawerTriggerProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@base-ui/react'
import type { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { ReactNode } from 'react'
import { useIsMobile } from '#lib/hooks'
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface AdaptiveProps<TDrawerProps, TPopoverProps> {
  drawer?: TDrawerProps
  popover?: TPopoverProps
  children?: ReactNode
}

/**
 *  renders either a popover or a drawer depending on the screen width
 */
export function AdaptivePanel({
  children,
  drawer,
  popover,
}: AdaptiveProps<DrawerRootProps, PopoverRootProps>) {
  const isMobile = useIsMobile()

  return isMobile
    ? <Drawer {...drawer}>{children}</Drawer>
    : <Popover {...popover}>{children}</Popover>
}

export function AdaptivePanelTrigger({
  children,
  drawer,
  popover,
}: AdaptiveProps<DrawerTriggerProps, PopoverTriggerProps>) {
  const isMobile = useIsMobile()

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
  const isMobile = useIsMobile()

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
