import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const ACTIVE = 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90'

export function NetworkToggle() {
  return (
    <ToggleGroup type="single" value="hoodi" className="rounded-md border">
      <ToggleGroupItem value="hoodi" className={ACTIVE} aria-label="Testnet (Hoodi)">
        Testnet
      </ToggleGroupItem>
      <ToggleGroupItem value="mainnet" className={ACTIVE} aria-label="Mainnet — not yet supported" disabled>
        Mainnet
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
