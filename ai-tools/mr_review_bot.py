"""
AI-powered GitHub PR review bot using OpenAI gpt-4o.
Reads git diff → calls OpenAI API → posts one PR comment with severity table.

GitHub Actions env vars (auto-set):
  GITHUB_TOKEN            — Actions token with pull-requests: write permission
  GITHUB_REPOSITORY       — owner/repo (e.g. itthikorn-sut/quantium-demo)
  GITHUB_EVENT_NUMBER     — PR number
  GITHUB_BASE_REF         — base branch (e.g. main)

Required secrets (set in repo Settings > Secrets > Actions):
  OPENAI_API_KEY          — OpenAI API key
"""
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error
from openai import OpenAI

SYSTEM_PROMPT = """You are a senior QA engineer reviewing a code diff for Quantium CORE — a private equity fund management platform (Angular + ASP.NET Core).

Analyze the diff for QA-relevant issues. Return ONLY a JSON array, no other text.
Each item: {"file": "path/to/file", "line": <integer>, "severity": "CRITICAL|HIGH|MEDIUM|LOW", "issue": "one sentence", "suggestion": "one sentence fix"}

Severity rules:
- CRITICAL: financial calculation changed without test coverage; data loss risk; security vulnerability
- HIGH: input validation missing for financial amounts; RBAC/permission check removed; error silently swallowed
- MEDIUM: missing null/undefined guard on API response; loading state not handled; error message not user-friendly
- LOW: minor UX/accessibility issue; inconsistent naming

Focus on: financial logic changes, missing validation, permission changes, error handling gaps, Angular null checks.
If no issues: return []"""


def get_diff(base_branch: str) -> str:
    subprocess.run(['git', 'fetch', 'origin', base_branch], capture_output=True)
    result = subprocess.run(
        ['git', 'diff', f'origin/{base_branch}...HEAD', '--unified=3'],
        capture_output=True, text=True
    )
    return result.stdout[:15000]  # cap at 15k chars to stay within context


def analyze_diff(diff: str) -> list[dict]:
    if not diff.strip():
        return []
    client = OpenAI()
    response = client.chat.completions.create(
        model='gpt-4o',
        max_tokens=2048,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': f'Review this diff:\n\n```diff\n{diff}\n```'},
        ],
    )
    text = response.choices[0].message.content.strip()
    start = text.find('[')
    end = text.rfind(']') + 1
    if start == -1:
        return []
    return json.loads(text[start:end])


def build_pr_comment(comments: list[dict]) -> str:
    severity_emoji = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🔵'}
    order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    sorted_comments = sorted(comments, key=lambda c: order.get(c.get('severity', 'LOW'), 3))

    counts = {s: sum(1 for c in comments if c.get('severity') == s) for s in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}
    summary_parts = [f"{severity_emoji[s]} {counts[s]} {s}" for s in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] if counts[s] > 0]

    lines = [
        '## 🤖 AI QA Review',
        '',
        f"**Summary:** {', '.join(summary_parts) if summary_parts else '✅ No issues found'}",
        '',
    ]

    if sorted_comments:
        lines += [
            '| Severity | File | Issue | Suggestion |',
            '|----------|------|-------|-----------|',
        ]
        for c in sorted_comments:
            sev = c.get('severity', 'LOW')
            emoji = severity_emoji.get(sev, '⚪')
            file_ref = f"`{c.get('file', 'unknown')}:{c.get('line', '?')}`"
            lines.append(f"| {emoji} **{sev}** | {file_ref} | {c.get('issue', '')} | {c.get('suggestion', '')} |")

    if counts.get('CRITICAL', 0) > 0:
        lines += ['', '> ⛔ **CRITICAL issues found. QA review required before merge.**']
    elif counts.get('HIGH', 0) > 0:
        lines += ['', '> ⚠️ **HIGH severity issues found. Review before merging.**']
    else:
        lines += ['', '> ✅ No blocking issues. Review suggestions above.']

    lines += ['', '_— AI QA Review Bot powered by OpenAI gpt-4o_']
    return '\n'.join(lines)


def post_pr_comment(repo: str, pr_number: str, token: str, body: str):
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/comments'
    payload = json.dumps({'body': body}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Accept', 'application/vnd.github.v3+json')
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-GitHub-Api-Version', '2022-11-28')
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"PR comment posted: {json.loads(resp.read()).get('html_url', '')}")
    except urllib.error.HTTPError as e:
        print(f"Failed to post comment: {e.code} {e.reason}", file=sys.stderr)
        sys.exit(1)


def main():
    repo = os.environ['GITHUB_REPOSITORY']
    pr_number = os.environ['GITHUB_EVENT_NUMBER']
    token = os.environ['GITHUB_TOKEN']
    base_branch = os.environ.get('GITHUB_BASE_REF', 'main')

    print(f'Analyzing diff vs origin/{base_branch}...')
    diff = get_diff(base_branch)

    if not diff:
        print('No changes detected.')
        return

    print('Calling OpenAI API...')
    comments = analyze_diff(diff)
    print(f'Found {len(comments)} issues.')

    body = build_pr_comment(comments)
    post_pr_comment(repo, pr_number, token, body)

    criticals = [c for c in comments if c.get('severity') == 'CRITICAL']
    if criticals:
        print(f'{len(criticals)} CRITICAL issue(s) — failing CI to block merge.')
        sys.exit(1)


if __name__ == '__main__':
    main()
