# Initialize Test Project Structure

```
Create a standardized test project folder structure following best practices.

Project Ticket: {{input}}

## Recommended Project Structure

Create this structure in `active/[JIRA-ID]_[Short_Description]/`:

```
[JIRA-ID]_[Short_Description]/
├── README.md                 # Project overview and navigation
├── confluence/               # HLD and design documentation
│   └── confluence_links.md   # Index of Confluence links (if any)
├── test_plan/                # Test planning documents
│   ├── README.md             # Test plan index and summary
│   └── sections/             # Modular test plan sections
│       ├── 01_Project_Business_Context.md
│       ├── 02_Feature_Definition.md
│       ├── 03_Scope_Boundaries.md
│       ├── 04_Test_Strategy.md
│       ├── 05_References_Resources.md
│       └── 06_Revision_History.md
├── test_cases/               # Detailed test cases
│   ├── README.md             # Test case index
│   ├── TS-01_[Scenario].md   # Test scenario files
│   └── TS-02_[Scenario].md
├── 00_Main_Task_[TICKET].md  # Main ticket details
└── Ticket_Relationship_Diagram.md  # Ticket trace
```

## Agent Instructions:

### 1. Parse Input
- Extract Jira ticket ID from input
- Fetch ticket details using `jira_get_issue`
- Generate short description from ticket summary

### 2. Create Folder Structure
```bash
# Create main project folder
mkdir -p active/[JIRA-ID]_[Short_Description]

# Create subfolders
mkdir -p active/[Project]/confluence
mkdir -p active/[Project]/test_plan/sections
mkdir -p active/[Project]/test_cases
```

### 3. Generate Initial Files

**README.md** - Project overview:
```markdown
# [JIRA-ID]: [Ticket Summary]

**Status:** In Progress
**Epic:** [JIRA-ID](https://yourcompany.atlassian.net/browse/[JIRA-ID])
**QA Engineer:** [Name]
**Created:** [Date]

---

## Overview

[Brief description of the feature/project]

---

## Project Structure

| Folder | Purpose |
|--------|---------|
| `confluence/` | HLD and design documentation |
| `test_plan/` | Test planning documents |
| `test_cases/` | Detailed test cases |

---

## Quick Links

- [Main Ticket](00_Main_Task_[TICKET].md)
- [Test Plan](test_plan/README.md)
- [Test Cases](test_cases/README.md)

---

## Next Steps

1. [ ] Gather requirements from Jira/Confluence
2. [ ] Create test plan sections
3. [ ] Write test cases
4. [ ] Sync to TestLink
```

**test_plan/README.md** - Test plan index:
```markdown
# Test Plan: [JIRA-ID] - [Short Description]

**Test Plan Type:** New Feature Validation
**Test Plan Version:** 1.0
**Created:** [Date]
**Last Updated:** [Date]
**QA Engineer:** [Name]

---

## Test Plan Sections

1. [Project & Business Context](sections/01_Project_Business_Context.md)
2. [Feature Definition](sections/02_Feature_Definition.md)
3. [Scope & Boundaries](sections/03_Scope_Boundaries.md)
4. [Test Strategy](sections/04_Test_Strategy.md)
5. [References & Resources](sections/05_References_Resources.md)
6. [Revision History](sections/06_Revision_History.md)

---

## Quick Reference

- **Total Test Scenarios:** TBD
- **Estimated Test Cases:** TBD
- **Feature Flag:** TBD
- **Minimum Firmware:** TBD
```

**test_cases/README.md** - Test case index:
```markdown
# Test Cases: [JIRA-ID] - [Short Description]

**Version:** 1.0
**Created:** [Date]
**QA Engineer:** [Name]

---

## Test Scenarios

| File | Test Scenario | Test Cases |
|------|---------------|------------|
| TS-01_*.md | TBD | TC-01 to TC-XX |
| TS-02_*.md | TBD | TC-01 to TC-XX |

---

## Test Case Numbering

- Each scenario file uses independent TC numbering (TC-01, TC-02, etc.)
- Full ID format: `TS-XX-TC-YY` (e.g., TS-01-TC-01)

---

## Related Documentation

- [Test Plan](../test_plan/README.md)
- [HLD Document](../confluence/)
```

### 4. Fetch Jira Ticket Details

Create `00_Main_Task_[TICKET].md` with:
- Full ticket metadata
- Description
- Comments
- Related links

### 5. Check for Confluence Links

If Confluence links found:
- Fetch page content
- Save to `confluence/[Page_Title].md`
- Create `confluence/confluence_links.md` index

## Naming Conventions:

### Folder Name
- Format: `[JIRA-ID]_[Short_Description]`
- Use underscores, no spaces
- Keep description to 2-4 words
- Example: `PROJ-12345_Feature_Integration`

### File Names
| Type | Convention |
|------|------------|
| Main task | `00_Main_Task_[TICKET].md` |
| Related tickets | `01_[Description]_[TICKET].md` |
| Test scenarios | `TS-XX_[Scenario_Name].md` |

## Example:

**Input:** `PROJ-12345`

**Output:**
```
active/PROJ-12345_Feature_Integration/
├── README.md
├── confluence/
│   └── confluence_links.md
├── test_plan/
│   ├── README.md
│   └── sections/
│       ├── 01_Project_Business_Context.md
│       ├── 02_Feature_Definition.md
│       ├── 03_Scope_Boundaries.md
│       ├── 04_Test_Strategy.md
│       ├── 05_References_Resources.md
│       └── 06_Revision_History.md
├── test_cases/
│   └── README.md
├── 00_Main_Task_PROJ-12345.md
└── Ticket_Relationship_Diagram.md
```

## Tips:

- Use `/jr-trace` first if you need full ticket hierarchy
- Don't create empty test scenario files - create during test case design
- Update README.md as project progresses
- Use consistent naming throughout
```
