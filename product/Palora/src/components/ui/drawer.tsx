import { Sheet, type SheetProps } from "@/components/ui/sheet"

export interface DrawerProps extends SheetProps {}

export function Drawer(props: DrawerProps) {
  return <Sheet side="bottom" {...props} />
}
