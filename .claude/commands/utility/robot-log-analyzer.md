# Robot Log Analyzer

```
Analyze Robot Framework test logs and compare with test case requirements:

{{input}}

Process:
1. Understand requirements - identify target directories and analysis goals
2. Extract test cases from XML files using grep search for content categories
3. Identify XML structure boundaries (testsuite start/end tags with line numbers)
4. Extract complete test sections into separate organized files
5. Create summary of extracted test cases with IDs, names, and objectives
6. Analyze Robot Framework HTML logs for execution results (window.output, PASS/FAIL)
7. Use specialized search techniques for Robot Framework metadata
8. Map automation capabilities to test objectives
9. Identify what each automated test actually validates
10. Provide capability assessment (what works, what's tested)
11. Present results with clear headings and bullet points

Key Tools:
- TaskCreate / TaskUpdate: Track progress through complex multi-step analysis
- Grep: Search for specific patterns in large files
- Read: Examine file contents with offset/limit for large files
- Agent: Delegate complex analysis to specialized agents when needed
- Glob: Verify directory structure and file availability

Key XML Extraction Patterns (for output.xml):
- <test name="..."> - Test case boundary
- <status status="PASS"> - Test passed
- <status status="FAIL"> - Test failed
- <msg level="FAIL"> - Failure message
- <testsuite> and </testsuite> - Suite boundaries

Key HTML Extraction Patterns (for log.html):
- Search for window.output in HTML (Robot Framework stores results as JS object)
- Look for PASS/FAIL status markers in the JS data
- Extract test names and failure messages from the JS data

Focus on:
- Test case names and PASS/FAIL results
- Test capabilities demonstrated
- Key automation features found
- Actual vs expected test coverage
- Structured output with clear categorization
- Focus on actual findings rather than gaps
- List specific test cases found with names and results

Success Factors:
- Start broad, then narrow focus based on feedback
- Use appropriate tools for file size and complexity
- Provide structured, scannable output
- Focus on actual capabilities rather than theoretical coverage
- Adapt presentation style based on user preferences (lists vs paragraphs)
```
