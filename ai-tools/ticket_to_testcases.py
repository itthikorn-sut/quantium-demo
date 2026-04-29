"""
Ticket-to-TestCase converter for Quantium CORE interview demo.

Usage:
  python ticket_to_testcases.py --ticket-id CORE-BUG-001 --format gherkin
  python ticket_to_testcases.py --ticket-id CORE-FEAT-101 --format playwright
  python ticket_to_testcases.py --all --format steps
  python ticket_to_testcases.py --ticket-id CORE-BUG-001 --format gherkin --save

Requirements:
  pip install openai
  export OPENAI_API_KEY=your_key_here
"""
import argparse
import json
import os
from openai import OpenAI

MOCK_FILE = os.path.join(os.path.dirname(__file__), 'mock_tickets.json')

SYSTEM_PROMPT = """You are a senior QA engineer specializing in private equity fintech software (fund management, capital calls, IRR, ILPA reports, waterfall distributions, accounting).

Convert ticket descriptions into comprehensive test cases covering:
1. Happy path (expected normal use)
2. Edge cases (boundary values: zero amounts, max amounts, single records, date boundaries)
3. Negative cases (invalid input, unauthorized access, exceeding limits, missing required fields)
4. UI assertions (visibility, labels, validation messages, empty states)
5. API assertions (status codes, response body structure, data integrity — e.g. debit=credit, amount <= commitment)

Rules:
- For financial features: ALWAYS include zero-amount case, negative-amount case, amount-exceeds-limit case, decimal precision case
- For permission/auth features: ALWAYS include unauthorized user case and verify error message is user-friendly (not raw API error)
- For calculation features: include known-value case with manually verified expected result
- Be specific to the Quantium CORE domain — use real field names from the product"""

FORMAT_HINTS = {
    'gherkin': 'Gherkin BDD (Feature / Background / Scenario / Given / When / Then / And)',
    'steps': 'Numbered plain-text test steps. Format each as: [TC-XXX] [HAPPY|EDGE|NEGATIVE|UI|API] Description → Steps → Expected result',
    'playwright': 'Playwright TypeScript skeleton. Use test.describe() and test() blocks. Include comments for expected assertions.',
}


def load_ticket(ticket_id: str) -> dict:
    with open(MOCK_FILE) as f:
        tickets = json.load(f)
    match = next((t for t in tickets if t['id'] == ticket_id), None)
    if not match:
        raise ValueError(f"Ticket {ticket_id} not found. Available: {[t['id'] for t in tickets]}")
    return match


def convert(ticket: dict, output_format: str) -> str:
    client = OpenAI()
    response = client.chat.completions.create(
        model='gpt-4o',
        max_tokens=2048,
        messages=[
            {
                'role': 'system',
                'content': SYSTEM_PROMPT,
            },
            {
                'role': 'user',
                'content': (
                    f"Convert this ticket to test cases in {FORMAT_HINTS[output_format]} format.\n\n"
                    f"Ticket ID: {ticket['id']}\n"
                    f"Title: {ticket['title']}\n\n"
                    f"Description:\n{ticket['description']}\n\n"
                    "Generate all categories: happy path, edge cases, negative cases, UI assertions, API assertions."
                ),
            },
        ],
    )
    return response.choices[0].message.content


def main():
    parser = argparse.ArgumentParser(description='Convert Quantium CORE tickets to test cases using OpenAI gpt-4o')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--ticket-id', help='Ticket ID (e.g. CORE-BUG-001)')
    group.add_argument('--all', action='store_true', help='Convert all tickets')
    parser.add_argument('--format', choices=['gherkin', 'steps', 'playwright'], default='gherkin')
    parser.add_argument('--save', action='store_true', help='Save output to example_output.md')
    args = parser.parse_args()

    if args.all:
        with open(MOCK_FILE) as f:
            tickets = json.load(f)
    else:
        tickets = [load_ticket(args.ticket_id)]

    results = []
    for ticket in tickets:
        header = f"\n{'='*60}\n{ticket['id']} — {ticket['title']}\n{'='*60}\n"
        output = convert(ticket, args.format)
        results.append(header + output)
        print(header + output)

    if args.save:
        out_path = os.path.join(os.path.dirname(__file__), 'example_output.md')
        with open(out_path, 'w') as f:
            f.write('\n'.join(results))
        print(f"\nSaved to {out_path}")


if __name__ == '__main__':
    main()
