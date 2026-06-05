# Generate Demo Recording Share Email

Generate an email for sharing demo recordings with the team.

**Usage:** `/pm-demo-email [PROJECT_PATH]`

**Arguments:**
- `$ARGUMENTS` - Path to project folder containing `Demo_Showcase_Content.md` or test plan/README/HLD

---

## Design Principles

Demo share emails should be **concise and scannable**, with clear sections that help recipients quickly understand what was built and where to watch the demo.

### Email Structure

| Section | Purpose | Content |
|---------|---------|---------|
| **Opening** | Context | "We've created a demo recording... It's about X minutes long." |
| **What We Built** | Brief description | 1-2 sentences, user-facing capability |
| **The Problem** | Why it matters | 3-5 bullet points of user pain |
| **What's New** | Key changes | 3-5 bullet points of improvements |
| **Demo Recording** | Links | Duration + 2-3 links (video, slides) |
| **The recording shows:** | Content preview | 3-4 bullets of what viewers will see |
| **Key Benefits** | Value summary | 3-4 bullets of user value |
| **Closing** | Sign off | Questions invitation + thanks |

### What to Exclude

| Exclude | Reason |
|---------|--------|
| **Feature flags** | Internal implementation |
| **Backend values** | Technical detail |
| **Navigation steps** | Save for demo itself |
| **Detailed flow** | Covered in recording |
| **Customer names** | Unless approved |

---

## Template

```markdown
# Demo Recording Share: [TICKET]

**Subject:** Demo Recording: [Feature Name] - [TICKET]

Hi Team,

We've created a demo recording for our latest feature. It's about [X] minutes long.

**What We Built**

[1-2 sentences describing the user-facing capability in plain language.]

**The Problem**

- [User pain point 1]
- [User pain point 2]
- [User pain point 3]
- [User pain point 4 - optional]

**What's New**

- [Key change 1]
- [Key change 2]
- [Key change 3]
- [Key change 4 - optional]

**Demo Recording (~[X] minutes)**

- [Link 1 - primary video]
- [Link 2 - backup/alternate]
- [Link 3 - slides if available]

**The recording shows:**
- [Demo content 1]
- [Demo content 2]
- [Demo content 3]

**Key Benefits**

- [Benefit 1]: [One sentence explanation]
- [Benefit 2]: [One sentence explanation]
- [Benefit 3]: [One sentence explanation]

If you have any questions, please let me know.

Thanks,
[Name]
```

---

## Example Output

Based on PROJ-67890:

```markdown
# Demo Recording Share: PROJ-67890

**Subject:** Demo Recording: Device Last Seen & Uptime - PROJ-67890

Hi Team,

We've created a demo recording for our latest feature. It's about 3 minutes long.

**What We Built**

We added "Last Seen" and "Uptime" information to Device Properties. This information now shows even when devices are offline.

**The Problem**

- When a device goes offline, the system shows "No Online information"
- Network admins couldn't see when the device was last seen
- No way to see the device's last uptime before it disconnected
- Hard to troubleshoot downtime without this information

**What's New**

- "Last Seen" and "Uptime" fields now always show for all device states
- Disconnected devices show the last known timestamp and uptime
- Fields are easier to find (moved before the divider)
- Works the same in Device Properties card and modal view

**Demo Recording (~3 minutes)**

- [Link 1]
- [Link 2]
- [Slides.pptx]

**The recording shows:**
- The problem - disconnected device with no information
- The solution - same device now shows Last Seen and Last Uptime
- Examples - connected, disconnected, and never-connected devices

**Key Benefits**

- **Better troubleshooting:** Know exactly when device was last seen
- **Historical context:** See last uptime before disconnection
- **No data loss:** Information stays even when device is offline

Simple change with big value.

If you have any questions, please let me know.

Thanks,
[Name]
```

---

## Agent Instructions

1. **Read project context** from (in order of preference):
   - `demo/Demo_Showcase_Content.md` (preferred - reuse bullets/content from merged file)
   - `Demo_Showcase_Content.md` in project root (legacy location)
   - Project README.md
   - Test plan README.md or sections
   - HLD/Confluence documentation
   - Jira ticket summary

2. **Extract key information**:
   - Feature name and ticket ID
   - User-facing capability (brief description)
   - Problems being solved (user pain points)
   - What's new (key changes)
   - Key benefits (user value)

3. **Apply exclusion rules**:
   - No feature flag mentions
   - No backend/API implementation details
   - No navigation steps (save for demo)
   - No customer examples unless provided

4. **Generate email format**:
   - Use bullet points for easy scanning
   - Keep sections short and focused
   - Include placeholder links for recordings
   - Maintain professional but friendly tone

5. **Output to file**:
   - Create `demo/` folder in project root if it doesn't exist
   - Save as `demo/Demo_Showcase_Email.md`

---

## Writing Guidelines

### Good vs Bad Bullets

| Bad (Technical) | Good (User-Focused) |
|-----------------|---------------------|
| "API returns lastSeenTimestamp field" | "Last Seen field shows when device was online" |
| "Backend stores uptime in seconds" | "Uptime shows how long device was running" |
| "Field visibility controlled by device state enum" | "Fields show for all device states" |

### Benefit Statement Format

Format: **[Benefit Name]:** [One sentence explanation]

Examples:
- **Better troubleshooting:** Know exactly when device was last seen
- **Historical context:** See last uptime before disconnection
- **No data loss:** Information stays even when device is offline

### Demo Content Preview Format

Use simple phrases that describe what viewers will see:
- "The problem - [brief description]"
- "The solution - [brief description]"
- "Examples - [what's demonstrated]"

## Paired Review

The share email is a text deliverable for an outside reader — pair it with its review.
Before sending, run `reviewing-phrasing` on it (reader, content, tone, purpose, use) and
apply the findings.
