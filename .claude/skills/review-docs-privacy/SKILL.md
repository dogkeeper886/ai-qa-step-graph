---
name: review-docs-privacy
description: Review codebase for documentation quality and information security
user-invocable: true
---

# Review Guidelines

Review the codebase for documentation quality and information security.

## Review Checklist

### 1. Personal Information Leakage

Scan all files for:
- Real email addresses (replace with `user@example.com`)
- Real usernames or account IDs (replace with generic names like `john-doe`, `user123`)
- Real IP addresses (replace with `192.168.1.1`, `10.0.0.1`, or `localhost`)
- Real hostnames or domain names (replace with `example.com`, `test.local`)
- Real file paths containing usernames (replace with `/home/user/`, `/path/to/project/`)
- Real API keys, tokens, or secrets (remove or replace with `<YOUR_API_KEY>`)
- Real organization or company names (replace with generic terms)

### 2. Example Quality

Ensure all examples use:
- Generic, universally applicable use cases
- Placeholder values that are clearly not real data
- Standard example domains: `example.com`, `example.org`, `test.local`
- Standard example paths: `/path/to/project/`, `/home/user/`
- Standard example names: `your-project`, `my-app`, `sample-service`

### 3. Documentation Standards

Check that documentation:
- Uses inclusive, generic language
- Provides examples that any user can relate to
- Does not assume specific environments or setups
- Clearly marks placeholder values that users must replace

## Files to Review

- `README.md` and all markdown files
- Code comments in all source files
- YAML configuration files and examples
- Shell scripts
- GitHub workflow files

## Actions

1. List all files that contain potential personal information
2. For each file, identify the specific lines with issues
3. Suggest replacements using generic examples
4. Apply fixes to make the documentation universally applicable
