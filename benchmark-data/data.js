window.BENCHMARK_DATA = {
  "lastUpdate": 1793449670102,
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
      }
    ]
  }
}