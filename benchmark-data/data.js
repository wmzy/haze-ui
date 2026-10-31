window.BENCHMARK_DATA = {
  "lastUpdate": 1793431179960,
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
      }
    ]
  }
}