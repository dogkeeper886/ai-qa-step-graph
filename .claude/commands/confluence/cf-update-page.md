# Update Confluence Page

```
Update an existing Confluence page {{page_id}} with new markdown content.

Content Source: $ARGUMENTS (file path or inline content)

Steps:
1. Get current page {{page_id}} to retrieve current title
2. Read content from provided file path or use inline content
3. Update page with new markdown content
4. Add version comment if provided

## Example Usage:
/cf-update-page 987654321 @test_plan/README.md
/cf-update-page 987654321 "Updated content here"

## Agent Processing:
1. Call confluence_get_page with page_id to get current title
2. Read content from file path or use provided content
3. Call confluence_update_page with:
   - page_id: {{page_id}}
   - title: current title from step 1
   - content: markdown content
   - version_comment: "Updated via Claude Code"
4. Confirm update was successful

## MCP Tool:
mcp__mcp-atlassian__confluence_update_page

## Parameters:
- page_id (required): The page ID
- title (required): The page title
- content (required): New markdown content
- content_format: 'markdown' (default)
- is_minor_edit: false (default)
- version_comment: Optional change description

## Notes:
- Always get current page first to retrieve title
- Confluence auto-increments version number
- Previous versions preserved in page history
```
