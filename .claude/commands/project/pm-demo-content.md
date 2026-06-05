# Generate Demo Showcase Content

Generate combined slide content and speaking script for product demo presentations. Each slide includes both **bullets** (what goes on the slide) and **script** (what the presenter says), keeping them in sync.

**Usage:** `/pm-demo-content [PROJECT_PATH]`

**Arguments:**
- `$ARGUMENTS` - Path to project folder containing test plan, README, or HLD

---

## Design Principles

Demo content should be **concise and user-focused**, with bullets for slides and conversational script for the presenter co-located per slide.

- `**Bullets:**` = what goes on the slide (concise, scannable)
- `**Script:**` = what presenter says (verbose, conversational, quoted speech)
- Both live together per slide so edits stay in sync

### Slide Structure (6 slides maximum)

| Slide | Title | Bullets | Script |
|-------|-------|---------|--------|
| 1 | Title | Ticket ID + Feature Name + Subtitle | One sentence introduction |
| 2 | What We Built | 3-4 user-facing capabilities | Single paragraph, no technical details |
| 3 | The Problem | 3-4 user impacts being solved | User impact focus, not system internals |
| 4 | What's New | UI changes and behaviors | Navigation steps + UI explanation |
| 5 | Demo | Screenshot placeholder | Observational language phrases |
| 6 | Questions | Q&A slide | Brief closing statement |

### Slide 4 Script Scope

When the demo expands beyond a single slide (more than 6 slides total), Slide 4's script must be a **brief transition only** — not a walkthrough. The detail belongs on each individual demo slide, not pre-narrated on Slide 4.

- **Wrong:** Slide 4 walks through creation steps, locked fields, auto-proxy, and filtering — then each demo slide narrates the same thing again.
- **Right:** Slide 4 says *"Let me walk through each of these in the product."* Each demo slide carries its own narration.

### Paired Slide Rule

When two adjacent slides cover the same concept from two angles (e.g., IP-locked vs FQDN-locked, Auth override vs Acct override), the **second slide should reference the first** rather than repeat the full explanation:
- *"Same guardrail on the FQDN side — ..."*
- *"The same filtering applies to the Accounting dropdown — ..."*

### What to Exclude

| Exclude | Reason |
|---------|--------|
| **Feature flags** | Internal implementation detail |
| **Backend values** | Technical detail (e.g., "-1 means unlimited") |
| **Customer examples** | Unless explicitly provided |
| **Time estimates** | Keep flexible for live demo |
| **Who Should Attend** | Attendees are already there |
| **Ready to Demo checklist** | Presenter handles this |
| **Next Steps** | Not needed for demo |
| **Detailed demo flow** | Presenter knows the flow |

---

## Template

```markdown
# Demo Showcase: [TICKET]
## [Feature Name]

---

## Slide 1: Title
**Title:** [TICKET]: [Feature Name]
**Subtitle:** [One-line description of the capability]

**Script:**
"Today I'm going to show you our new feature: [Feature Name]. This is for ticket [TICKET]."

---

## Slide 2: What We Built
**Title:** What We Built
**Bullets:**
- [User-facing capability 1]
- [User-facing capability 2]
- [User-facing capability 3]
- [User-facing capability 4 - optional]

**Script:**
"Let me start by explaining what we built. [One paragraph describing user-facing capability. Focus on what users can do, not how it's implemented.]"

---

## Slide 3: The Problem
**Title:** The Problem
**Bullets:**
- [User pain point 1]
- [User pain point 2]
- [User pain point 3]
- [User pain point 4 - optional]

**Script:**
"Now, let's talk about the problem we're solving. [Problem description focused on user impact - what was broken, frustrating, or missing for users.]"

---

## Slide 4: What's New
**Title:** What's New
**Bullets:**
- [UI change or new option 1]
- [UI change or new option 2]
- [Behavior change 1]
- [Supported configurations]

**Script:**
"To access this setting:
1. Navigate to [Menu] > [Submenu] > [Page]
2. Select [option or item]
3. Click on [menu or button]
4. Select the [tab or section]"

"Under [Section Name], you'll see [UI element description]."

"[Explain default state - what users see initially.]"

"[Explain first option - what happens when enabled/checked.]"

"[Explain second option - what happens when disabled/unchecked.]"

"This feature works with [list of supported types/networks/configurations]."

---

## Slide 5: Demo
**Title:** Demo
**Content:** [Screenshot placeholder or `![alt](screenshots/NN_Description.png)`]

**Script:**
"Now let me show you how [feature] looks in action."
"You can see [observation about current state]."
"Let me click on [element]."
"Notice [key observation]. This is [explanation of what it means]."
"Look at the [column/field] - it shows '[value]'. This is the key difference."

---

## Slide 6: Questions
**Title:** Questions?

**Script:**
"That's [Feature Name]. Thank you for watching."
```

---

## Example Output

Based on PROJ-54321:

```markdown
# Demo Showcase: PROJ-54321
## Dynamic Limit Configuration for User Portal

---

## Slide 1: Title
**Title:** PROJ-54321: Dynamic Limit Configuration
**Subtitle:** Configurable Device Limits for User Portal Networks

**Script:**
"Today I'm going to show you our new feature: Dynamic Limit Configuration for User Portal. This is for ticket PROJ-54321."

---

## Slide 2: What We Built
**Title:** What We Built
**Bullets:**
- Unlimited maximum devices per credential option
- Checkbox to toggle between limited and unlimited
- Support for values up to 1000 when limited
- Works with Email Auth, Admin Approval, LDAP Server, SAML Provider

**Script:**
"Let me start by explaining what we built. We added support for unlimited maximum devices per credential in User Portal networks. The feature has a UI checkbox that lets admins choose between limited (1-1000 devices) or unlimited devices per credential."

---

## Slide 3: The Problem
**Title:** The Problem
**Bullets:**
- Modern devices use session token rotation
- Users exhaust device limits in days of normal usage
- Users get blocked from network unexpectedly
- No way for admins to allow truly unlimited connections

**Script:**
"Now, let's talk about the problem we're solving. Modern devices use session token rotation - they create a new session token each time they connect to the network. With the old 10-device limit, a single user could use up all their allowed devices in just a few days of normal usage. This causes several issues: users get blocked from the network, support tickets increase, customers complain, and network administrators have no way to fix it."

---

## Slide 4: What's New
**Title:** What's New
**Bullets:**
- New "Max devices per user" checkbox in User Connection settings
- When checked: number input (1-1000) for device limit
- When unchecked: unlimited devices allowed
- User Session Credentials shows "Not Applicable" status for unlimited

**Script:**
"To access this setting:
1. Navigate to Settings > Networks > Network List
2. Select a network to edit or create new network
3. Click on More Settings in the left menu
4. Select the User Connection tab"

"Under User Connection Settings, you'll see the Max devices per user checkbox."

"The default is checked - this keeps backward compatibility with existing networks."

"When enabled, admins can set a high value like 1000 to effectively allow device connections per user."

"When unchecked, the field hides and the system allows unlimited devices."

"This feature works with four network types: Email Auth, Admin Approval, LDAP Server, and SAML Provider."

---

## Slide 5: Demo
**Title:** Demo
**Content:** [Insert screenshot of User Connection settings with checkbox]

**Script:**
"Now let me show you how the unlimited devices feature looks like in Clients page."
"You can see we have three clients currently connected."
"Let me click on the 'User Session Credentials' tab."
"Notice we have two credentials here. The first one is Email Auth, and the Network is Demo-Unlimited. Now look at the Status column - it says 'Not Applicable'. This is the key difference. When a network has unlimited devices, the system doesn't track device count, so the status shows 'Not Applicable'."

---

## Slide 6: Questions
**Title:** Questions?

**Script:**
"That's Dynamic Limit Configuration for User Portal. Thank you for watching."
```

---

## Agent Instructions

1. **Read project context** from:
   - Project README.md
   - Test plan README.md or sections
   - HLD/Confluence documentation
   - Jira ticket summary

2. **Extract key information**:
   - Feature name and ticket ID
   - User-facing capabilities (3-4 bullets)
   - Problems being solved (3-4 bullets)
   - UI changes and behaviors
   - Navigation path to feature
   - UI behavior (defaults, options, changes)

3. **Apply exclusion rules**:
   - No feature flag mentions
   - No backend/API implementation details
   - No customer examples unless provided
   - No time estimates
   - No "Who Should Attend" or "Next Steps"

4. **Generate slide bullets**:
   - Start with action or outcome
   - User-focused language
   - Short and scannable (under 10 words ideal)
   - No technical jargon

5. **Generate conversational script**:
   - Use quoted speech throughout
   - Use observational language for live demo
   - Keep sections flowing naturally
   - Include navigation steps in Slide 4 only when the demo has a single slide; otherwise use a brief transition sentence

6. **Review scripts for overlap** before saving (for a full narration and flow audit, run `/pm-script-review` after saving):
   - Read all slide scripts in sequence
   - If a script pre-narrates content covered verbatim or near-verbatim on a later slide, trim the earlier occurrence to a transition phrase
   - Slide 4 is the most common offender: if individual demo slides each narrate their own UI element, Slide 4's script should only bridge into the demo — not retell it
   - Paired slides (same concept, two angles) must differentiate: the second slide references the first rather than repeating the full explanation

7. **Output to file**:
   - Create `demo/` folder in project root if it doesn't exist
   - Save as `demo/Demo_Showcase_Content.md`
   - If `Demo_Showcase_Content.md` exists at project root (legacy location), suggest moving it to `demo/`

---

## Bullet Writing Guidelines

### Good Bullets
- Start with action or outcome
- User-focused language
- Short and scannable (under 10 words ideal)
- No technical jargon

### Examples

| Bad (Technical) | Good (User-Focused) |
|-----------------|---------------------|
| "Backend API returns -1 for unlimited" | "Unlimited devices option available" |
| "Feature flag guest-unlimited-max-devices-toggle" | "New checkbox in User Connection settings" |
| "System sets maxDevices property to -1" | "When unchecked: unlimited devices allowed" |
| "Credential status returns N/A from API" | "Status shows 'Not Applicable' for unlimited" |

---

## Live Demo Phrase Library

Use these conversational phrases during live demo sections:

### Transitioning
- "Now let me show you..."
- "Let me click on..."
- "I'm going to navigate to..."

### Observing
- "You can see..."
- "Notice..."
- "Look at the [field/column]..."
- "Here you can see..."

### Highlighting Differences
- "This is the key difference."
- "Notice the difference between..."
- "Compare this to..."

### Explaining Behavior
- "When you [action], [result]."
- "This means..."
- "The system [behavior]."

### Summarizing
- "So in summary..."
- "That's how [feature] works."
