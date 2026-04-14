import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ComparisonPage() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Operator comparison</CardTitle>
        <CardDescription>
          Diffs operator data between the SSV subgraph and on-chain Views contract
          on Hoodi testnet. Wired up in milestone 1.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled>Run comparison</Button>
      </CardContent>
    </Card>
  )
}
