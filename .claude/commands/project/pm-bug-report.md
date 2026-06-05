# Bug Report Generator

## Purpose
Generate clear, well-structured bug reports for easy copying to Jira, email, or documentation.

## Input
- title (string): Brief, descriptive title of the bug
- description (string): What the bug is and when it happens
- steps (array): Step-by-step reproduction instructions
- actual_behavior (string): What actually happens
- expected_behavior (string): What should happen
- note (string, optional): Additional context or technical details

## Process
1. Create clear, simple title that describes the problem
2. Write concise description without duplicating steps
3. List detailed reproduction steps
4. Clearly state actual vs expected behavior
5. Add technical notes if needed

## Output
Formatted bug report in markdown ready for copy-paste

## Guidelines
- **Section order**: Description → Steps → Actual → Expected → Note
- **Use simple words**: "shows" not "displays", "go to" not "navigate to"
- **Avoid duplication**: Don't repeat steps in description
- **Be specific**: Include exact UI elements and actions
- **Keep it short**: One clear sentence per section

## Template
```
## Bug Report

**Problem/Title**: {{title}}

**Description**: 
{{description}}

**Steps to Reproduce**:
1. {{step1}}
2. {{step2}}
3. {{step3}}
...

**Actual Behavior**: {{actual_behavior}}

**Expected Behavior**: {{expected_behavior}}

**Note**: {{note}}
```

## Paired Review

The bug report is a text deliverable for an outside reader — pair it with its review.
Before it goes to Jira/email, run `reviewing-phrasing` on it (reader, content, tone,
purpose, use), apply the findings, then send.
