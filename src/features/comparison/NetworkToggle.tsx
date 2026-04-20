import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { NetworkId } from '@/config'
import { useNetwork } from '@/store/networkContext'

const ACTIVE = 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90'

export function NetworkToggle() {
  const { networkId, setNetwork } = useNetwork()

  function onValueChange(next: string) {
    if (!next) return
    if (next !== 'mainnet' && next !== 'hoodi') return
    setNetwork(next as NetworkId)
  }

  return (
    <ToggleGroup
      type="single"
      value={networkId}
      onValueChange={onValueChange}
      className="rounded-md border"
    >
      <ToggleGroupItem value="mainnet" className={ACTIVE} aria-label="Mainnet">
        Mainnet
      </ToggleGroupItem>
      <ToggleGroupItem value="hoodi" className={ACTIVE} aria-label="Testnet (Hoodi)">
        Testnet
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
