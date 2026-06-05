# Rewrite Text

```
Rewrite this text in simple, easy words while keeping the original meaning:

{{input}}

## Rewriting Guidelines:

### Keep the Core Meaning
- Preserve what actually failed or happened
- Preserve expected vs actual behavior
- Preserve any relevant values (URLs, file paths, data)

### Simplify Technical Jargon

| Technical | Plain English |
|-----------|---------------|
| `AssertionError: Expected: True but got: False` | "The test expected this to be enabled, but it was disabled" |
| `ConnectionRefusedError: [Errno 111] Connection refused` | "Could not connect to the server — it may be down or unreachable" |
| `TimeoutException: Element not clickable after 30s` | "The button/element didn't appear within 30 seconds — page may not have loaded" |
| `NoSuchElementException: Unable to locate element` | "The expected UI element was not found on the page" |
| `AttributeError: 'NoneType' object has no attribute 'text'` | "A required element was missing — the page returned no data for this field" |

### Rewritten Message Format
```
Original: [paste original error message]
Plain English: [rewritten explanation]
What this means: [what the test was trying to verify]
Why it failed: [likely cause]
```

### Batch Rewriting
When rewriting multiple messages in a report:
1. Only rewrite messages that are unclear or cryptic
2. For simple, self-explanatory failures, keep as-is with brief context
3. Group similar failures — rewrite once, apply to all in group
4. Focus on actionable language: what happened, what to check
```
