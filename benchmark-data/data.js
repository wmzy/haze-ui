window.BENCHMARK_DATA = {
  "lastUpdate": 1795443876923,
  "repoUrl": "https://github.com/wmzy/haze-ui",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "committer": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "distinct": true,
          "id": "e8f0afc3754acac7b1c364f173b81eca7a572caf",
          "message": "Extract shared menu/picker/grid parts; harden markdown XSS",
          "timestamp": "2026-10-31T15:13:11+08:00",
          "tree_id": "9cc0f38c6ad51ca9decbd47318e7a40edf180e7e",
          "url": "https://github.com/wmzy/haze-ui/commit/e8f0afc3754acac7b1c364f173b81eca7a572caf"
        },
        "date": 1793431179058,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 312.564854,
            "unit": "ms",
            "extra": "±51.236157 ms (rme 16.39%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 3.41,
            "unit": "ops/s",
            "extra": "±0.43 ops/s (rme 12.55%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 203.069699,
            "unit": "ms",
            "extra": "±50.180323 ms (rme 24.71%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 5.55,
            "unit": "ops/s",
            "extra": "±0.84 ops/s (rme 15.10%, n=15)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.495095,
            "unit": "ms",
            "extra": "±0.012509 ms (rme 2.53%, n=2020)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 2268.78,
            "unit": "ops/s",
            "extra": "±21.58 ops/s (rme 0.95%, n=2020)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.88342,
            "unit": "ms",
            "extra": "±0.071162 ms (rme 3.78%, n=532)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 589.19,
            "unit": "ops/s",
            "extra": "±13.34 ops/s (rme 2.26%, n=532)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 2.086248,
            "unit": "ms",
            "extra": "±0.045231 ms (rme 2.17%, n=480)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 502.43,
            "unit": "ops/s",
            "extra": "±9.04 ops/s (rme 1.80%, n=480)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "committer": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "distinct": true,
          "id": "d9fd487e4115325c90f1489e0991ae35e533db2a",
          "message": "Fix lint errors and PhoneInput axe timeout for CI\n\n- islamic.ts: wrap getDaysInMonth in an arrow at the call site\n  (unbound-method), matching the adapter.ts precedent\n- menuKeyboard.test.ts: block-body act callbacks so act's return\n  stays void (no-floating-promises x4)\n- PhoneInput axe test: 20s timeout — axe walks the ~240-option\n  country listbox, 5.4s+ under coverage instrumentation on CI\n  vs 5s default (MarkdownRenderer precedent)",
          "timestamp": "2026-10-31T15:26:29+08:00",
          "tree_id": "6cff559bf11d8c9891d198d8079e93bb8b3793ef",
          "url": "https://github.com/wmzy/haze-ui/commit/d9fd487e4115325c90f1489e0991ae35e533db2a"
        },
        "date": 1793431633998,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 155.004356,
            "unit": "ms",
            "extra": "±17.299324 ms (rme 11.16%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 6.63,
            "unit": "ops/s",
            "extra": "±0.55 ops/s (rme 8.27%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 120.431167,
            "unit": "ms",
            "extra": "±20.847802 ms (rme 17.31%, n=17)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 8.84,
            "unit": "ops/s",
            "extra": "±0.88 ops/s (rme 9.97%, n=17)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.210772,
            "unit": "ms",
            "extra": "±0.004527 ms (rme 2.15%, n=4748)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 5305.32,
            "unit": "ops/s",
            "extra": "±26.1 ops/s (rme 0.49%, n=4748)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 0.801617,
            "unit": "ms",
            "extra": "±0.032358 ms (rme 4.04%, n=1248)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 1475.44,
            "unit": "ops/s",
            "extra": "±24.82 ops/s (rme 1.68%, n=1248)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 0.781278,
            "unit": "ms",
            "extra": "±0.01126 ms (rme 1.44%, n=1281)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 1339.31,
            "unit": "ops/s",
            "extra": "±12.93 ops/s (rme 0.97%, n=1281)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "committer": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "distinct": true,
          "id": "1c791f2766f6c877bbbaa4b608c0b2afc4dc034c",
          "message": "refactor: consolidate shared skins, picker metrics, and locale strings",
          "timestamp": "2026-10-31T20:26:30+08:00",
          "tree_id": "3dcfb9481669c2efe9753dc6ed987d2c5c428a78",
          "url": "https://github.com/wmzy/haze-ui/commit/1c791f2766f6c877bbbaa4b608c0b2afc4dc034c"
        },
        "date": 1793449669101,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 246.145373,
            "unit": "ms",
            "extra": "±44.555643 ms (rme 18.10%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 4.37,
            "unit": "ops/s",
            "extra": "±0.57 ops/s (rme 13.10%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 154.484115,
            "unit": "ms",
            "extra": "±31.25059 ms (rme 20.23%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 6.97,
            "unit": "ops/s",
            "extra": "±0.81 ops/s (rme 11.59%, n=15)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.344761,
            "unit": "ms",
            "extra": "±0.008278 ms (rme 2.40%, n=2901)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 3263.89,
            "unit": "ops/s",
            "extra": "±23.68 ops/s (rme 0.73%, n=2901)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.111403,
            "unit": "ms",
            "extra": "±0.075037 ms (rme 6.75%, n=900)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 1027.04,
            "unit": "ops/s",
            "extra": "±16.88 ops/s (rme 1.64%, n=900)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 1.316476,
            "unit": "ms",
            "extra": "±0.020907 ms (rme 1.59%, n=760)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 793.37,
            "unit": "ops/s",
            "extra": "±11.16 ops/s (rme 1.41%, n=760)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "committer": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "id": "1c791f2766f6c877bbbaa4b608c0b2afc4dc034c",
          "message": "refactor: consolidate shared skins, picker metrics, and locale strings",
          "timestamp": "2026-10-31T12:26:30Z",
          "url": "https://github.com/wmzy/haze-ui/commit/1c791f2766f6c877bbbaa4b608c0b2afc4dc034c"
        },
        "date": 1793621741664,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 319.208548,
            "unit": "ms",
            "extra": "±48.267599 ms (rme 15.12%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 3.32,
            "unit": "ops/s",
            "extra": "±0.41 ops/s (rme 12.41%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 217.244041,
            "unit": "ms",
            "extra": "±48.547905 ms (rme 22.35%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 5.09,
            "unit": "ops/s",
            "extra": "±0.72 ops/s (rme 14.15%, n=15)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.489521,
            "unit": "ms",
            "extra": "±0.012916 ms (rme 2.64%, n=2043)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 2289.63,
            "unit": "ops/s",
            "extra": "±20.64 ops/s (rme 0.90%, n=2043)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.917785,
            "unit": "ms",
            "extra": "±0.076868 ms (rme 4.01%, n=522)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 583.76,
            "unit": "ops/s",
            "extra": "±13.85 ops/s (rme 2.37%, n=522)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 2.079202,
            "unit": "ms",
            "extra": "±0.037395 ms (rme 1.80%, n=481)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 498.61,
            "unit": "ops/s",
            "extra": "±8.19 ops/s (rme 1.64%, n=481)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "committer": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "distinct": true,
          "id": "2e8484b2e239f21ab78d084d361f71a8bca440ce",
          "message": "Extract shared skins and drag/picker hooks; fix Image error recovery",
          "timestamp": "2026-11-06T12:23:56+08:00",
          "tree_id": "5e563d23ac16004000f61b266b9a46c1c0defab9",
          "url": "https://github.com/wmzy/haze-ui/commit/2e8484b2e239f21ab78d084d361f71a8bca440ce"
        },
        "date": 1793939114500,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 162.002127,
            "unit": "ms",
            "extra": "±13.519813 ms (rme 8.35%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 6.28,
            "unit": "ops/s",
            "extra": "±0.42 ops/s (rme 6.66%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 118.849606,
            "unit": "ms",
            "extra": "±7.516562 ms (rme 6.32%, n=17)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 8.52,
            "unit": "ops/s",
            "extra": "±0.47 ops/s (rme 5.53%, n=17)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.226317,
            "unit": "ms",
            "extra": "±0.004071 ms (rme 1.80%, n=4419)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 4740.75,
            "unit": "ops/s",
            "extra": "±22.35 ops/s (rme 0.47%, n=4419)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 0.771951,
            "unit": "ms",
            "extra": "±0.05346 ms (rme 6.93%, n=1296)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 1502.71,
            "unit": "ops/s",
            "extra": "±18.15 ops/s (rme 1.21%, n=1296)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 0.918359,
            "unit": "ms",
            "extra": "±0.023226 ms (rme 2.53%, n=1089)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 1193.57,
            "unit": "ops/s",
            "extra": "±15.81 ops/s (rme 1.32%, n=1089)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "committer": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "id": "2e8484b2e239f21ab78d084d361f71a8bca440ce",
          "message": "Extract shared skins and drag/picker hooks; fix Image error recovery",
          "timestamp": "2026-11-06T04:23:56Z",
          "url": "https://github.com/wmzy/haze-ui/commit/2e8484b2e239f21ab78d084d361f71a8bca440ce"
        },
        "date": 1794228311900,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 283.670334,
            "unit": "ms",
            "extra": "±11.574367 ms (rme 4.08%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 3.54,
            "unit": "ops/s",
            "extra": "±0.14 ops/s (rme 4.01%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 180.023861,
            "unit": "ms",
            "extra": "±9.206461 ms (rme 5.11%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 5.59,
            "unit": "ops/s",
            "extra": "±0.26 ops/s (rme 4.61%, n=15)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.456035,
            "unit": "ms",
            "extra": "±0.008498 ms (rme 1.86%, n=2193)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 2310.67,
            "unit": "ops/s",
            "extra": "±14.19 ops/s (rme 0.61%, n=2193)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.725127,
            "unit": "ms",
            "extra": "±0.064695 ms (rme 3.75%, n=580)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 634.71,
            "unit": "ops/s",
            "extra": "±11.65 ops/s (rme 1.83%, n=580)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 1.877883,
            "unit": "ms",
            "extra": "±0.029209 ms (rme 1.56%, n=533)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 545.02,
            "unit": "ops/s",
            "extra": "±5.94 ops/s (rme 1.09%, n=533)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "committer": {
            "email": "1256573276@qq.com",
            "name": "wmzy",
            "username": "wmzy"
          },
          "distinct": true,
          "id": "8b2cc6047dc86b825e0cef4cc1f989453298a5c2",
          "message": "fix(ci): migrate to jsdom 31 / Playwright 1.65 and hold TypeScript at 6",
          "timestamp": "2026-11-16T11:41:58+08:00",
          "tree_id": "2f75954ca5e16e95d56a4f14729dcd2252f36e07",
          "url": "https://github.com/wmzy/haze-ui/commit/8b2cc6047dc86b825e0cef4cc1f989453298a5c2"
        },
        "date": 1794801511427,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 173.605946,
            "unit": "ms",
            "extra": "±8.688083 ms (rme 5.00%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 5.8,
            "unit": "ops/s",
            "extra": "±0.29 ops/s (rme 5.01%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 104.941767,
            "unit": "ms",
            "extra": "±6.002392 ms (rme 5.72%, n=20)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 9.65,
            "unit": "ops/s",
            "extra": "±0.47 ops/s (rme 4.91%, n=20)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.325553,
            "unit": "ms",
            "extra": "±0.00643 ms (rme 1.98%, n=3072)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 3291.77,
            "unit": "ops/s",
            "extra": "±19.98 ops/s (rme 0.61%, n=3072)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 0.979645,
            "unit": "ms",
            "extra": "±0.059398 ms (rme 6.06%, n=1021)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 1184.54,
            "unit": "ops/s",
            "extra": "±18.03 ops/s (rme 1.52%, n=1021)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 1.143011,
            "unit": "ms",
            "extra": "±0.024148 ms (rme 2.11%, n=875)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 905.87,
            "unit": "ops/s",
            "extra": "±8.12 ops/s (rme 0.90%, n=875)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "semantic-release-bot",
            "username": "semantic-release-bot",
            "email": "semantic-release-bot@martynus.net"
          },
          "committer": {
            "name": "semantic-release-bot",
            "username": "semantic-release-bot",
            "email": "semantic-release-bot@martynus.net"
          },
          "id": "5e57b5824c38b7c91cc19cc3ceef1e94b895eea1",
          "message": "chore(release): 1.35.1 [skip ci]",
          "timestamp": "2026-11-16T03:46:01Z",
          "url": "https://github.com/wmzy/haze-ui/commit/5e57b5824c38b7c91cc19cc3ceef1e94b895eea1"
        },
        "date": 1794832693007,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 231.94596,
            "unit": "ms",
            "extra": "±17.143675 ms (rme 7.39%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 4.38,
            "unit": "ops/s",
            "extra": "±0.31 ops/s (rme 7.02%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 120.847765,
            "unit": "ms",
            "extra": "±8.688669 ms (rme 7.19%, n=17)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 8.4,
            "unit": "ops/s",
            "extra": "±0.5 ops/s (rme 5.98%, n=17)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.446073,
            "unit": "ms",
            "extra": "±0.008508 ms (rme 1.91%, n=2242)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 2384.28,
            "unit": "ops/s",
            "extra": "±16.58 ops/s (rme 0.70%, n=2242)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.272863,
            "unit": "ms",
            "extra": "±0.066927 ms (rme 5.26%, n=786)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 886.4,
            "unit": "ops/s",
            "extra": "±14.9 ops/s (rme 1.68%, n=786)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 1.499506,
            "unit": "ms",
            "extra": "±0.025641 ms (rme 1.71%, n=667)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 686.97,
            "unit": "ops/s",
            "extra": "±7.19 ops/s (rme 1.05%, n=667)"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "committer": {
            "name": "wmzy",
            "username": "wmzy",
            "email": "1256573276@qq.com"
          },
          "id": "db7c0e6110394743d7b25d3a2929fc1af5c3facb",
          "message": "fix(examples): repair copilotkit-recipe type errors in weekly CI\n\n- import useControl from the haze-ui barrel (it re-exports react-use-control) and drop the example's direct react-use-control dep: the standalone lockfile resolved 1.6.0 while the linked library resolved 1.6.1, and Control<T>'s unique-symbol brand made the two copies' types mutually incompatible (Control<boolean> not assignable to ControlOrValue<boolean>)\n- Badge migrated variant -> color; update the call site",
          "timestamp": "2026-11-23T04:13:30Z",
          "url": "https://github.com/wmzy/haze-ui/commit/db7c0e6110394743d7b25d3a2929fc1af5c3facb"
        },
        "date": 1795443876377,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · latency",
            "value": 243.157776,
            "unit": "ms",
            "extra": "±10.367779 ms (rme 4.26%, n=15)"
          },
          {
            "name": "DataTable · renders 1000 rows · mount + unmount 1000 rows · throughput",
            "value": 4.13,
            "unit": "ops/s",
            "extra": "±0.17 ops/s (rme 4.14%, n=15)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · latency",
            "value": 131.379483,
            "unit": "ms",
            "extra": "±8.899384 ms (rme 6.77%, n=16)"
          },
          {
            "name": "DataTable · rerenders 1000 rows on sorting flips · sorting flip rerender (asc ⇄ desc) · throughput",
            "value": 7.71,
            "unit": "ops/s",
            "extra": "±0.45 ops/s (rme 5.86%, n=16)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · latency",
            "value": 0.463639,
            "unit": "ms",
            "extra": "±0.007914 ms (rme 1.71%, n=2157)"
          },
          {
            "name": "Select · toggles the floating panel open and closed · open + close cycle (50 options) · throughput",
            "value": 2283.92,
            "unit": "ops/s",
            "extra": "±16.72 ops/s (rme 0.73%, n=2157)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · latency",
            "value": 1.539362,
            "unit": "ms",
            "extra": "±0.063565 ms (rme 4.13%, n=650)"
          },
          {
            "name": "VirtualList · renders 5000 items · mount + unmount 5000 items (windowed) · throughput",
            "value": 723.55,
            "unit": "ops/s",
            "extra": "±13.86 ops/s (rme 1.92%, n=650)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · latency",
            "value": 1.9071,
            "unit": "ms",
            "extra": "±0.038536 ms (rme 2.02%, n=525)"
          },
          {
            "name": "VirtualList · moves the window on scroll · scroll event → window rerender · throughput",
            "value": 542.29,
            "unit": "ops/s",
            "extra": "±6.96 ops/s (rme 1.28%, n=525)"
          }
        ]
      }
    ]
  }
}