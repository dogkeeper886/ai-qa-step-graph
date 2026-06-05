# Create Meeting Invite

Generate a meeting invite for test plan review, test cases review, or demo showcase.

**Usage:** `/pm-meeting-invite [PROJECT_PATH]`

**Arguments:**
- `$ARGUMENTS` - Path to project folder

---

## When to Use

| Type | Trigger |
|------|---------|
| Test Plan Review | After test plan is published and ready for stakeholder review |
| Test Cases Review | After test cases are published and ready for stakeholder review |
| Demo Showcase | After demo content and screenshots are created |

---

## Design Principles

### 1. White Space for Grouping

Use blank lines to create visual separation between sections. Related items stay together, unrelated items have space between them.

```
## Section A

Content for section A
- Item 1
- Item 2

## Section B

Content for section B
```

### 2. Font Weight for Hierarchy

Use bold (**text**) to create visual anchors and establish hierarchy:

| Element | Format | Purpose |
|---------|--------|---------|
| Section titles | `## Title` | Primary navigation |
| Numbered items | `**1. Item**` | Secondary anchors within sections |
| Link labels | `**Label:**` | Tertiary anchors for reference items |

### 3. Dark Grey Color (Calendar Rendering)

When rendered in calendar apps (Outlook, Teams), links appear in a muted/dark color that draws attention to "detail info to read" without being distracting. The link text provides context, the URL is secondary.

### 4. Reference-Style Links

Keep the body clean by moving URLs to the bottom:

```markdown
**Test Plan:** [Descriptive Title][test-plan]

**Epic:** [Ticket Title][epic]

[test-plan]: https://confluence.example.com/pages/12345
[epic]: https://jira.example.com/browse/PROJ-12345
```

Benefits:
- Body text remains scannable
- URLs grouped at bottom for reference
- Easy to update links without changing body

---

## Best Practices

### Review Meeting

| Do | Avoid |
|----|-------|
| One-sentence purpose | Meeting Details (Subject, Date, Duration, Location, Attendees) |
| Numbered agenda with bullet details | Horizontal rule separators between content sections |
| Reference-style links at bottom | Time allocations in agenda (10 min, 25 min) |
| | Entry Criteria, Key Questions, Calendar Invite Text sections |
| | Emojis or icons |

### Demo Showcase

A good demo invite answers **3 questions** for the reader:

1. **Why should I care?** — Lead with the problem, not the solution
2. **What will I see?** — Brief preview of the demo flow
3. **What do I need to do?** — Show up, and optionally review materials

| Do | Avoid |
|----|-------|
| Keep it under 1 page | Listing every technical detail (save for the demo) |
| Lead with the problem | Making the invite longer than the demo |
| Be audience-aware | Mixing invite with documentation |
| Time-box the demo flow | Jargon overload for non-technical stakeholders |
| One CTA at the end | Feature flag names or backend details |

### General Formatting

1. Keep it concise - only essential information
2. Use descriptive link titles (not raw URLs)
3. Use reference-style links for clean body text
4. Group related items together with white space
5. Use bold for visual anchors and hierarchy
6. No emojis or decorative elements

---

## Review Meeting Template

### Sections

1. **Purpose** - One sentence explaining what will be reviewed
2. **Agenda** - Numbered sections with bullet points
3. **Please Review Before Meeting** - Reference-style links to documents

### Template

```markdown
# Meeting Invite: [Review Type] - [TICKET]

## Purpose

Review [test plan/test cases] for [TICKET] to ensure [alignment with HLD / quality and readiness for execution].

## Agenda

**1. [Overview Section]**
- [Key point 1]
- [Key point 2]
- [Key point 3]

**2. [Review Section]**
- [Item 1]
- [Item 2]
- [Item 3]

## Please Review Before Meeting

**Test Plan:** [PROJ-XXXXX: Test Plan - Feature Name][test-plan]

**Test Cases:** [PROJ-XXXXX: Test Cases - Feature Name][test-cases]

**Epic:** [PROJ-XXXXX Feature Name][epic]

**HLD:** [HLD - Feature Name][hld]

**Figma:** [UX Wireframes][figma]

[test-plan]: https://confluence-url
[test-cases]: https://confluence-url
[epic]: https://jira-url
[hld]: https://confluence-url
[figma]: https://figma-url
```

### Example Output

Based on PROJ-12345:

```markdown
# Meeting Invite: Test Plan & Test Cases Review - PROJ-12345

## Purpose

Review the test plan and test cases for PROJ-12345 (User Session Management) to ensure alignment with the HLD, adequate coverage of both Basic and Advanced modes, and readiness for test execution.

## Agenda

**1. Feature Overview**
- User Session Management: Basic mode (single session) and Advanced mode (multi-session)
- Backend service integration for automatic session lifecycle
- Feature flag gating: `session-management-toggle`

**2. Test Plan Review**
- 8 test scenarios covering feature flag, Basic mode, Advanced mode, auto-behavior, input validation, backward compatibility, config templates, and multi-tenant
- State-based and journey-based test design approach
- Scope boundaries: UI/API testing (no backend internals)

**3. Test Cases Review**
- 32 test cases across 8 scenarios
- Key coverage areas: session rules, renewal, mode switching, legacy data migration
- Validation and error handling: 8 dedicated test cases for input boundary conditions

**4. Open Discussion**
- Test environment and feature build availability
- Risk areas: concurrent session edge cases, session limit, time zone handling

## Please Review Before Meeting

**Test Plan:** [PROJ-12345: Test Plan - User Session Management][test-plan]

**Test Cases:** [PROJ-12345: Test Cases - User Session Management][test-cases]

**Epic:** [PROJ-12345 User Session Management][epic]

**HLD:** [HLD - User Session Management][hld]

**Figma:** [UX Wireframes - Session Management][figma]

[test-plan]: https://confluence.example.com/wiki/spaces/PROJ/pages/TODO
[test-cases]: https://confluence.example.com/wiki/spaces/PROJ/pages/TODO
[epic]: https://jira.example.com/browse/PROJ-12345
[hld]: https://confluence.example.com/wiki/spaces/PROJ/pages/123456789
[figma]: https://www.figma.com/design/example/FR-1234-session-management
```

---

## Demo Showcase Template

### Sections

1. **What We Built** - One paragraph describing the feature
2. **The Problem** - 3-5 user pain points
3. **What's New** - Bold feature names with descriptions
4. **Demo Flow (X minutes)** - Numbered steps with time allocations
5. **Who Should Attend** - Target audience
6. **Why This Matters** - 3-4 business benefits
7. **Ready to Demo** - Environment readiness checklist + CTA

### Sections to AVOID

- Detailed technical specs or architecture
- Feature flag names or backend implementation details
- Full test coverage breakdowns
- Reference links section (unlike review invites, demo invites are self-contained)

### Template

```markdown
# Demo Invitation: [TICKET]
## [Feature Name]

### What We Built
[One paragraph describing what was built — user-focused, no technical details]

### The Problem
- [User pain point 1]
- [User pain point 2]
- [User pain point 3]

### What's New
**[Feature 1]** - [description]

**[Feature 2]** - [description]

**[Feature 3]** - [description]

### Demo Flow ([duration] minutes)
1. **Show the problem** - [description] ([X] min)
2. **Walk through [feature]** - [description] ([X] min)
3. **Questions and next steps** ([X] min)

### Who Should Attend
- Product Managers
- Support Engineers
- [Other relevant teams]

### Why This Matters
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Ready to Demo
- Test environment is set up
- Sample configurations prepared
- All features working and tested

**Contact the team to schedule your demo.**
```

### Example Output

Based on PROJ-67890:

```markdown
# Demo Invitation: PROJ-67890
## Unlimited Max Devices per Credential for Guest Portal

### What We Built
We added support for unlimited maximum devices per credential in guest portal networks.

### The Problem
- Modern phones use MAC randomization - new MAC address every connection
- Old 10-device limit was hit in just a few days
- Users got blocked even though they owned the voucher
- No way for admins to fix this problem
- High-volume customers were stuck

### What's New
**New checkbox** in User Connection settings

**Two modes** - Limited (1-1000 devices) or Unlimited

**Works with 4 network types** - Self Sign-In, Host Approval, AD LDAP, SAML IdP

**Backward compatible** - Existing networks keep working

### Demo Flow (15 minutes)
1. **Show the problem** - current limitation (2 min)
2. **Enable feature flag** (1 min)
3. **Configure unlimited devices** - live demo (5 min)
4. **Switch between modes** (3 min)
5. **Test other network types** (2 min)
6. **Questions** (2 min)

### Who Should Attend
- Product Managers
- Support Engineers
- Network Administrators
- QA Team

### Why This Matters
- Solves MAC randomization problem
- Large customers can use the product without hitting limits
- Simple solution - just a checkbox
- No breaking changes to existing networks

### Ready to Demo
- Test environment: staging.example.com
- Feature flag ready
- Test scenarios prepared
- All features tested and working

**Contact the team to schedule your demo.**
```

---

## Agent Instructions

### Step 1: Determine Invite Type

```
IF arguments contain "demo" OR project has demo/ folder with Demo_Showcase_Content.md:
  → Demo Showcase invite
ELSE IF arguments contain "test plan" OR "plan":
  → Test Plan Review invite
ELSE IF arguments contain "test case" OR "case":
  → Test Cases Review invite
ELSE:
  → Ask user: "What type of invite? (test plan review / test cases review / demo showcase)"
```

### Step 2: Gather Context

**For Review invites**, read:
- Project README.md
- Test plan README.md
- Test cases README.md
- confluence/confluence_links.md (for Confluence URLs)

**For Demo invites**, read:
- Project README.md
- demo/Demo_Showcase_Content.md
- confluence/confluence_links.md (for Confluence URLs)

### Step 3: Search for Existing Examples

Search `active/` and `completed/` folders for existing invites of the same type to reference the latest style conventions:
- Review: `**/Meeting_Invite*Review*.md`
- Demo: `**/Demo_Showcase_Invite.md`

### Step 4: Generate Invite

Apply design principles (white space, font weight, reference links) and best practices for the invite type.

### Step 5: Output to File

| Type | Filename | Location |
|------|----------|----------|
| Test Plan Review | `Meeting_Invite_Test_Plan_Review.md` | Project root |
| Test Cases Review | `Meeting_Invite_Test_Cases_Review.md` | Project root |
| Demo Showcase | `Demo_Showcase_Invite.md` | Project root |

## Paired Review

The invite is a text deliverable for outside readers — pair it with its review. Before it
goes out, run `reviewing-phrasing` on it (reader, content, tone, purpose, use) and apply
the findings.
