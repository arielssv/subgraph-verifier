import { useState } from 'react'
import {
  getDefaultSubgraphUrl,
  getSubgraphUrl,
  resetSubgraphUrl,
  setSubgraphUrl,
} from '@/services/endpoint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function EndpointBar() {
  const defaultUrl = getDefaultSubgraphUrl()
  const [active, setActive] = useState(getSubgraphUrl())
  const [draft, setDraft] = useState(active)

  const isDirty = draft.trim() !== active
  const isCustom = active !== defaultUrl
  const isValid = /^https?:\/\/\S+$/.test(draft.trim())

  function onSave() {
    const next = draft.trim()
    if (!isValid || next === active) return
    setSubgraphUrl(next)
    setActive(next)
  }

  function onReset() {
    resetSubgraphUrl()
    setActive(defaultUrl)
    setDraft(defaultUrl)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && isDirty && isValid) onSave()
  }

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Subgraph endpoint
        </label>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={defaultUrl}
          className="h-8 min-w-0 flex-1 text-xs font-mono"
          spellCheck={false}
        />
        <Button
          size="sm"
          variant="default"
          onClick={onSave}
          disabled={!isDirty || !isValid}
          className="h-8"
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          disabled={!isCustom && !isDirty}
          className="h-8"
        >
          Reset
        </Button>
        {isDirty ? (
          <Badge variant="outline" className="text-xs">unsaved</Badge>
        ) : isCustom ? (
          <Badge variant="secondary" className="text-xs">custom</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">default</Badge>
        )}
      </div>
    </div>
  )
}
