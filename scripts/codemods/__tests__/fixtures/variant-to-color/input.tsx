import { Alert, Badge, Banner, Button, Meter, Sparkline, Tag } from 'haze-ui';

const Haze = { Tag };

export function StatusPanel({ thresholds, score }: { thresholds: number[]; score: number }) {
  return (
    <section>
      {/* unrelated components keep their props */}
      <Button variant="outline" size="sm">Refresh</Button>

      {/* variant → color (Alert, Badge, Banner, Tag); other props stay put */}
      <Alert variant="warning" closable>Cache is stale</Alert>
      <Badge variant="success" size="sm">Passing</Badge>
      <Banner variant="info">Deploy queued</Banner>
      <Tag variant="danger" closable removeLabel="Remove">failed</Tag>

      {/* member-expression element names resolve to the bare component */}
      <Haze.Tag variant="primary">oklch</Haze.Tag>

      {/* Sparkline: tone → color, its own variant (line|area) stays */}
      <Sparkline data={[3, 7, 4, 9]} variant="area" tone="danger" />

      {/* non-string values keep their expression untouched */}
      <Badge variant={score > 90 ? 'info' : 'danger'}>score</Badge>

      {/* Meter thresholds: inline literal objects rename tone → color */}
      <Meter
        value={score}
        label="Coverage"
        showValue
        thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]}
      />

      {/* non-literal thresholds are reported and left alone */}
      <Meter value={score} thresholds={thresholds} />

      {/* conflict: both old and new prop present — skipped for a human */}
      <Tag variant="success" color="primary">both</Tag>
    </section>
  );
}
