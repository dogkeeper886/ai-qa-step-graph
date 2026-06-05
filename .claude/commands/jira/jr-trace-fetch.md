# Jira Trace - Data Collection

```
Fetch main Jira ticket, related tickets, and Confluence documentation.

Jira Issue Key: {{input}}

## PURPOSE

Collect all relevant data for a Jira ticket:
1. Fetch main ticket with full details and comments
2. Find all related tickets (parent, children, linked)
3. Detect Confluence links in multiple sources
4. Fetch Confluence page content

---

## STEP 1: FETCH MAIN TICKET

Use `jira_get_issue` with these parameters:
- `fields='*all'` - Get all fields including custom fields
- `expand='renderedFields,changelog,comments,remotelinks'` - Get full details
- `comment_limit=100` - Ensure ALL comments are retrieved

```python
jira_get_issue(
    issue_key='[TICKET]',
    fields='*all',
    expand='renderedFields,changelog,comments,remotelinks',
    comment_limit=100
)
```

**Why comments matter:**
- Customer problem discussions
- Reproduction steps and technical details
- Problem-solving conversations
- Workarounds and behaviors
- Team collaboration and decisions

---

## STEP 2: FIND RELATED TICKETS

### Parent Ticket
- Check `parent` field in the main ticket response
- If exists, fetch with full details and comments

### Child Tickets
- Search using JQL: `parent = [TICKET]`
- Fetch each child with full details

```python
jira_search(jql='parent = [TICKET]', fields='*all')
```

### Linked Issues
- Check `issuelinks` field in the main ticket
- Types: blocks, is blocked by, relates to, duplicates, etc.
- Fetch each linked issue with full details

---

## STEP 3: DETECT CONFLUENCE LINKS

Check these sources for Confluence URLs:

### 3.1 Ticket Description Field
- Direct URLs in description text
- Smart links in Jira format

### 3.2 All Comments
- URLs in comment bodies
- Links shared during discussions

### 3.3 Changelog - RemoteWorkItemLink
- Look for entries with `"field": "RemoteWorkItemLink"`
- These indicate Confluence pages linked to the ticket
- Check the `created` date to see when linked

### 3.4 Custom Fields
- Some tickets have custom fields with documentation links

---

## CONFLUENCE URL PATTERNS

**Pattern 1:** Standard page URL
```
https://yourcompany.atlassian.net/wiki/spaces/SPACE/pages/[PAGE_ID]/Page+Title
```

**Pattern 2:** View page action
```
https://yourcompany.atlassian.net/wiki/pages/viewpage.action?pageId=[PAGE_ID]
```

**Extract page ID:**
- `/pages/123456789/` → Page ID: `123456789`
- `pageId=123456789` → Page ID: `123456789`

---

## STEP 4: FETCH CONFLUENCE PAGES

For each detected page ID:

```python
confluence_get_page(
    page_id='[PAGE_ID]',
    convert_to_markdown=True,
    include_metadata=True
)
```

**Collect from each page:**
- Full page content in markdown
- Metadata (page ID, space, version, URL)
- List of attachments

---

## OUTPUT

After data collection, you should have:

| Data | Source | Use |
|------|--------|-----|
| Main ticket details | `jira_get_issue` | 00_Main_Task file |
| All comments | `jira_get_issue` with comment_limit | Context and decisions |
| Parent ticket | Parent field | 01_ file |
| Child tickets | JQL search | 01_ files |
| Linked tickets | issuelinks field | 01_ files |
| Confluence pages | `confluence_get_page` | confluence/ folder |

---

## NEXT STEP

After collecting all data, proceed to:
- `/jr-trace-structure` - Create folder structure
- `/jr-trace-docs` - Download documentation files
- `/jr-trace-verify` - Validate downloads and generate summaries
```
