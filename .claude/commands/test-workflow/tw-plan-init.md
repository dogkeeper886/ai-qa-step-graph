# Test Plan Initialization

Initialize test planning by detecting the testing context type and routing to the appropriate workflow.

```
Use this command to start test planning. It will analyze your project and recommend the appropriate workflow.

{{input}}

## PURPOSE

Analyze the project documentation to:
1. Detect the testing context type (New Feature, Bug Fix, or Enhancement)
2. Verify prerequisites are in place
3. Route to the appropriate planning workflow

---

## AGENT WORKFLOW

### Pre-Check: Verify Context Availability

Before starting, verify these files exist (created by /jr-trace command):
- [ ] `00_Main_Task_*.md` - Main ticket file
- [ ] `README.md` - Project overview
- [ ] Related ticket files (`01_*.md`)

**Optional but helpful:**
- [ ] `confluence/*.md` - Confluence documentation (HLD, designs)

If `00_Main_Task_*.md` is missing, ask user: "Please run `/jr-trace [TICKET]` first to gather all documentation."

---

### Step 1: Detect Testing Context Type

Read the main ticket file (`00_Main_Task_*.md`) and determine the testing context:

**Type A: New Feature Testing**
- **Indicators:** Ticket type = Epic, Feature, Story
- **Has:** HLD in confluence/ folder, child tickets (UX, UI, API stories)
- **Focus:** Validate new functionality works as designed
- **Next Command:** `/tw-plan-feature`

**Type B: Customer Problem Testing (Bug Fix)**
- **Indicators:** Ticket type = Bug, Defect, Customer Issue
- **Has:** Comments with reproduction steps, customer reports
- **May lack:** HLD, design docs, stakeholder info
- **Focus:** Verify fix works, prevent recurrence
- **Next Command:** `/tw-plan-bugfix`

**Type C: Enhancement/Improvement Testing**
- **Indicators:** Ticket type = Enhancement, Improvement, Task
- **Has:** Partial design docs, describes changes to existing features
- **Focus:** Validate enhancement + integration impact
- **Next Command:** `/tw-plan-enhance`

---

### Step 2: Detection Logic

```
READ 00_Main_Task_*.md header section

IF ticket_type in ['Epic', 'Feature', 'Story']:
  → Report: "Type A: New Feature Testing detected"
  → Recommend: "Run /tw-plan-feature to continue"

ELSE IF ticket_type in ['Bug', 'Defect'] OR title contains 'customer issue':
  → Report: "Type B: Bug Fix Testing detected"
  → Recommend: "Run /tw-plan-bugfix to continue"

ELSE IF ticket_type in ['Enhancement', 'Improvement', 'Task']:
  → Report: "Type C: Enhancement Testing detected"
  → Recommend: "Run /tw-plan-enhance to continue"

ELSE:
  → Ask user: "Is this for: (A) New feature testing, (B) Bug fix testing, or (C) Enhancement testing?"
```

---

### Step 3: Provide Summary

Output a summary with:
1. Detected type and confidence level
2. Key indicators found
3. Recommended next command
4. Any missing prerequisites

---

## OUTPUT FORMAT

```markdown
# Test Plan Initialization: [Project Name]

## Detection Results

**Detected Type:** [Type A/B/C]: [Description]
**Confidence:** [High/Medium/Low]

### Indicators Found
- [Indicator 1]
- [Indicator 2]
- [Indicator 3]

### Prerequisites Status
- [x] Main ticket file exists
- [x] README.md exists
- [ ] Confluence HLD (optional)

## Recommended Next Step

Run `/tw-plan-[feature/bugfix/enhance]` to continue with test planning.

**Quick Reference:**
- `/tw-plan-feature` - New Feature Testing (comprehensive, 5-8 scenarios)
- `/tw-plan-bugfix` - Bug Fix Testing (focused, 2-4 scenarios)
- `/tw-plan-enhance` - Enhancement Testing (moderate, 4-6 scenarios)
```

---

## WORKFLOW POSITION

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST PLANNING WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘

/jr-trace [TICKET]
    └── Creates project structure and gathers documentation
                              ↓
              ┌───────────────────────────────┐
              │  /tw-plan-init  ◄── YOU ARE   │
              │  Detect type, verify prereqs  │
              └───────────────────────────────┘
                              ↓
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  /tw-plan-feature     /tw-plan-bugfix     /tw-plan-enhance
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
                     /tw-plan-review
                              ↓
                     /tw-case-init
```
```
