import { Option, Select } from '@/lib';
import { useSiteLocale } from '@/views/i18n';
import { versionInfo } from '@/views/version-info';
import versionsJson from '@/generated/versions.json';

type VersionEntry = { version: string; url: string };

type VersionsManifest = { latest: string; entries: VersionEntry[] };

/**
 * scripts/generate-versions.mjs 的产物：latest → 站点根、归档版本 →
 * /v/{version}/、dev → /dev/（离线兜底时为最小清单）。
 */
const manifest = versionsJson;

/**
 * 页头全局版本切换器：三通道文档（stable 根 / dev 子树 / v/{version}
 * 快照）之间的跳转入口。当前值由 version-info 的通道与版本推导；
 * 清单缺当前项时（旧快照内嵌的清单、离线兜底清单）补一项指向当前
 * 页，保证 select 永不空显。选中即整页跳转——三个通道是独立构建的
 * 站点，路由不共享。
 */
export default function VersionSwitcher() {
  const { t } = useSiteLocale();
  const current =
    versionInfo.channel === 'dev' || versionInfo.version === 'dev'
      ? 'dev'
      : versionInfo.version;
  const options = manifest.entries.some((entry) => entry.version === current)
    ? manifest.entries
    : [
        { version: current, url: import.meta.env.BASE_URL },
        ...manifest.entries,
      ];

  return (
    <Select
      size='sm'
      aria-label={t.chrome.version}
      value={current}
      onChange={(event) => {
        const entry = options.find(
          (candidate) => candidate.version === event.target.value
        );
        if (entry && entry.version !== current) {
          window.location.assign(entry.url);
        }
      }}
    >
      {options.map((entry) => (
        <Option key={entry.version} value={entry.version}>
          {entry.version}
        </Option>
      ))}
    </Select>
  );
}

export type { VersionEntry, VersionsManifest };
