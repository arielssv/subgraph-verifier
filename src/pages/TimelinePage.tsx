import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function TimelinePage() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Operator timeline</CardTitle>
        <CardDescription>
          Enter an operator ID to see all historical events. Wired up in milestone 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <input
          type="text"
          placeholder="Operator ID"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled
        />
        <Button disabled>Load</Button>
      </CardContent>
    </Card>
  )
}
