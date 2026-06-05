# Journey vs. API-Contract Separation

When the feature under test has both a GUI (or device-driven) user flow AND a backend API surface, the test plan splits cleanly along two axes. Mixing them in the same scenario creates noise — reviewers can't tell whether a case asserts user-visible behavior or wire contract.

## The split

| Tier | What it owns | Test approach | Where it lives |
|---|---|---|---|
| **Journey scenarios** (TS-01..TS-N) | The longest path a real actor can take through the feature | Web UI walk for admin; real client device for end user; assert on the visible outcome (incl. downloaded file contents) | One TS per journey lane (admin / end-user / cross-system / feature flag / backward compat) |
| **API contract scenario** (TS-N+1) | Behaviors the GUI longest path cannot generate | Direct API calls (curl / Postman / MCP) | One dedicated TS — append at the end of the scenario numbering |

## When the API tier is needed

You need a dedicated API contract scenario when **any** of these is in scope:

1. **Test-environment provisioning.** End-user scenarios need a fixture / network / identity / tenant data pre-existing. An admin who clicks through the UI to set it up is fragile; an API-driven fixture is reproducible and fast.
2. **Payload contract negatives.** The UI form validation prevents the test condition from ever being submitted (missing required keys, unknown extras, contradictory field combos). The only way to assert the backend's contract is to bypass the UI.
3. **Schema-drift backward compatibility.** Pre-feature records hit via the new API version. The user-visible side is journey (it renders without crash); the wire contract side is API (which fields are absent vs null, which version markers, whether the new API gracefully handles legacy records).
4. **Version skew.** Old clients (`Accept: v1.0`) hitting the new endpoint, or new clients hitting an older deployment. Pure contract concern; the UI is pinned to one version.
5. **Error-code semantics.** The design spec typically enumerates happy-path payloads but not 4xx / 5xx responses. Empirical capture per endpoint pins the contract and feeds undocumented findings to a follow-up ticket.

When **none** of these apply (feature is GUI-only, no published API contract, no version surface) — skip the API tier. Don't author it just for completeness.

## The longest-path rule

For every journey-tier case, ask: **what is the longest path a real actor takes to produce this assertion?**

- Admin saves a configuration → the longest path is *click Save → re-open profile → fields persist*. Not *click Save → curl GET /resources/{id}*.
- Admin observes records → longest path is *open the records tab → click Download → verify the downloaded file's contents*. Not *POST /records/query directly*.
- End user connects → longest path is *associate the device → open the page in browser → submit form → see the post-auth resource*. Not *POST /authenticate synthetically*.

The GUI / device click *implicitly* exercises the API; asserting on the visible outcome means a single test covers both surfaces. Drop to API-direct only for the conditions the longest path can't generate (see the list above).

## What this means for diagram structure

`test_design/scenarios/README.md` should keep its mermaid flow blocks **journey-shaped**: nodes name actions ("Save configuration", "Click Connect") not HTTP verbs ("POST /resources"). API plumbing inside journey nodes is noise — reviewers reading the journey diagram want to validate that the test script covers the user-visible flow, not the implementation.

When the API tier is needed, give it its **own diagram** under `diagrams/api_admin.mmd` (or `api_<surface>.mmd`). Shape: per-endpoint flowchart with branches for happy / negative / compat / version-skew / error-code outcomes, each branch tagged with the TS-N+1 subsection it belongs to. This is a *matrix* shape, not a journey shape — don't try to render it as a sequence diagram (sequence = journey).

## Scenario Index columns

Update the Scenario Index in `test_design/scenarios/README.md` to make the split visible at a glance:

| ID | Scenario | Focus | Test approach | Est. Cases |

- **Focus** values: `Admin GUI` / `End-user E2E` / `Admin GUI + End-user E2E` / `API`. Drop hybrid values like "GUI + API" — they hide which tier owns the case.
- **Test approach** values: `Web UI walk` / `Real device` / `Real device + admin UI observation` / `Web UI + downloaded file content` / `Direct API call`. This column is load-bearing for executors picking up the suite cold.

## TS-N+1 internal structure

The API contract TS should be sub-headed by concern, not by endpoint. Endpoints touch multiple concerns; concerns touch multiple endpoints. Suggested headings:

- **A. Test-Env Fixtures** — what to provision and how to assert on the response
- **B. Payload Contract Negatives** — missing required, unknown extras, defensive contracts
- **C. Schema-Drift Backward Compatibility** — pre-feature records via new API
- **D. Version Skew** — Accept header variations
- **E. Error-Code Semantics** — empirical per-endpoint capture

Where the design spec doesn't enumerate the expected behavior, the case wording should be **capture and flag for follow-up**, not assert an expected response. The API tier's job is partly to discover what the contract actually is.

## What stays in journey TS files

When promoting API-only bullets out to TS-N+1, the journey TS files should:

- Keep cases driven by web UI walks or device walks
- Keep user-visible compatibility cases (e.g., "pre-existing profile loads in admin UI without crash") — the UI-side assertion is journey
- Drop bullets that are API-only (e.g., "PUT with `optionalSection.enabled=false` + populated content")
- Add a one-line preamble pointing at TS-N+1 for the moved scope: *"Direct-API payload negatives, contract round-trip, and defensive-contract checks live in [TS-N+1](TS-NN_API_Contract.md)."*

## Reference shape

A canonical applied-shape: TS-01 / TS-06 are journey-pure (no HTTP verbs in the diagram), TS-09 owns the contract surface in 5 sub-sections (A–E above), and the journey diagrams read as actor scripts. When in doubt, that shape is the target.
