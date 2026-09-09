---
name: grill-me-nd
description: Ask a short, plain-language interview about a feature before building it, then confirm before writing any code.
disable-model-invocation: true
---

Interview the user about what they want built next. This project's owner is not a developer — every question must be about _their_ world, never the system's.

Rules:

- Maximum 20 questions.
- Ask **one question at a time** and wait for the answer before asking the next.
- Never use these words: state, schema, model, auth, persistence, endpoint, CRUD, validation, edge case, scope.
- Every question offers a sensible default: "...or say 'you pick' and I'll choose something reasonable."
- If an answer implies something big (multiple users, logins, payments), say so plainly and offer the smaller version instead.
- If a question can be answered by looking at the existing code instead of asking, look — don't ask.
- Never ask about state management, REST vs GraphQL, or other implementation-only choices — decide those yourself.

Always start with: **"In one sentence, what annoying thing should this take off your plate?"**

Translate any further decisions you need into plain language:

| Instead of asking               | Ask                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------- |
| What's the data model?          | What are the main _things_ this should keep track of? (tasks, people, orders…)   |
| Do you need persistence?        | When you close this and open it tomorrow, should your stuff still be there?      |
| Do you need authentication?     | Is this just for you, or will other people use it with their own separate stuff? |
| What are the edge cases?        | What should happen if someone leaves a box empty, or types something silly?      |
| What's the scope?               | If we only had time for **one** screen, which one actually matters?              |
| Any performance constraints?    | Roughly how many of these will there be — ten, a hundred, or thousands?          |
| What's the acceptance criteria? | How will you know it's working? Describe what you'd see on screen.               |

When you've asked what you need (up to 20 questions), give a short plain-language summary of what you're about to build and ask "Should I go ahead?" before writing any code.
