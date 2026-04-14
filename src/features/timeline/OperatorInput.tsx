import { useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  defaultValue?: string
  onLoad: (operatorId: string) => void
  disabled?: boolean
  buttonLabel?: string
}

export function OperatorInput({ defaultValue = '', onLoad, disabled, buttonLabel = 'Load' }: Props) {
  const [value, setValue] = useState(defaultValue)

  const submit = () => {
    const v = value.trim()
    if (!v) return
    onLoad(v)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Operator ID"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        className="max-w-[180px]"
      />
      <Button onClick={submit} disabled={disabled || !value.trim()}>
        {buttonLabel}
      </Button>
    </div>
  )
}
