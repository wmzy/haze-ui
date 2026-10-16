# Security Policy

## Supported versions

haze-ui is under active development; security fixes are applied to the
latest published release only. Please check the
[releases page](https://github.com/wmzy/haze-ui/releases) and test against
the version you run before reporting.

## Reporting a vulnerability

**Do not open a public issue for security problems.** Use GitHub's private
vulnerability reporting instead:

<https://github.com/wmzy/haze-ui/security/advisories/new>

Please include:

- a description of the issue and its impact,
- the affected haze-ui version(s) and the environment (browser, bundler,
  React version),
- a minimal reproduction or proof of concept,
- any possible mitigations you have identified.

You should receive an acknowledgment within a few days. Please do not
disclose the issue publicly until a fix is published.

## Scope

haze-ui is a client-side UI component library. Typical in-scope issues
include XSS through component props or rendered content, focus-trap escapes
in overlay components, and vulnerabilities in the published package
artifacts. Issues in dependent packages (React, dnd-kit, recharts, …)
should be reported to their maintainers; we will bump affected dependencies
when fixes are available.
