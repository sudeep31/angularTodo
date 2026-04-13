# 🚀 Angular Workflow with GitHub Copilot

_A practical guide for Angular developers who want AI that actually understands their codebase._

---

Hello all,

After 17 years of IT Experience, I've seen a lot of tooling come and go. But GitHub Copilot — when configured _properly_ for Angular — is genuinely game-changing. Not the out-of-the-box, generic autocomplete version. I mean a fully context-aware AI pair programmer that knows your Angular version, your coding standards, your test framework, and even how to review pull requests like a senior architect.

Everything I describe here is live and open source. You can browse the full setup in this Angular 21 Todo app:
👉 **[github.com/sudeep31/angularTodo](https://github.com/sudeep31/angularTodo)**

Let me walk you through exactly how it is structured — grab a coffee ☕, this is practical.

---

## The Full Setup — What's in the Repo

All files referenced in this article are live in this Angular 21 Todo project:
👉 **[github.com/sudeep31/angularTodo](https://github.com/sudeep31/angularTodo)**

Here is the exact `.github/` structure:

```
.github/
├── copilot-instructions.md           ← Global rules, always loaded
├── instructions/
│   ├── angular.instructions.md       ← Angular 21 patterns (applied to *.ts)
│   ├── tailwind.instructions.md      ← TailwindCSS rules (applied to *.html, *.css)
│   └── testing.instructions.md       ← Vitest patterns (applied to *.spec.ts)
├── skills/
│   └── angular-expert/
│       └── SKILL.md                  ← Deep architecture expertise, on-demand
└── agents/
    └── code-reviewer.agent.md        ← PR & code review agent with 7 checklists
```

---

## How Copilot Uses All of This

```
Your chat message
      │
      ▼
┌───────────────────────────────────────────┐
│             GitHub Copilot                │
│                                           │
│  0. Call MCP servers (live data first!)   │  ◄── Angular CLI, TailwindCSS, Nx
│  1. Read copilot-instructions.md          │  ◄── Always loaded, global context
│  2. Match instructions/ by file pattern   │  ◄── Auto-applied based on applyTo
│  3. Load a SKILL if the task is complex   │  ◄── On-demand specialist knowledge
│  4. Delegate to an Agent if it fits       │  ◄── Reusable workflow agents
└───────────────────────────────────────────┘
      │
      ▼
Context-aware, version-specific response ✅
```

---

## Part 1 — MCP Servers: Give Copilot Live Access to Your Tools ⚡

### What are they?

MCP (Model Context Protocol) servers are tools Copilot can call in real-time during a conversation. Instead of relying on static training data, Copilot can _actually query_ the Angular CLI, _actually search_ TailwindCSS docs, or _actually explore_ your Nx workspace graph — all while responding to you.

### Why set them up first?

Because everything else (instructions, skills, agents) works better when Copilot can validate its answers against live data. For example, `mcp_angular-cli_get_best_practices` returns guidelines for the _exact_ Angular version in your `package.json` — not a generic version that may be out of date.

### How to configure them

Add `.vscode/mcp.json` to your project:

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/mcp@latest"]
    },
    "tailwindcss": {
      "command": "npx",
      "args": ["-y", "@tailwindcss/mcp@latest"]
    },
    "nx": {
      "command": "npx",
      "args": ["-y", "@nx/mcp@latest"]
    }
  }
}
```

### What each server unlocks

| MCP Server      | What Copilot gains                                                              |
| --------------- | ------------------------------------------------------------------------------- |
| **Angular CLI** | Live best practices for your Angular version, component generation, docs search |
| **TailwindCSS** | Search utility docs, convert CSS to Tailwind classes, generate palettes         |
| **Nx**          | Explore project graph, discover generators, understand workspace dependencies   |

### Real example from the angularTodo project

When the code-reviewer agent runs, its very first step is:

```
1. mcp_angular-cli_get_best_practices
   → Returns current Angular 21 signal patterns, OnPush requirements,
     standalone component rules — live, not from memory.
```

This means the review adapts to your Angular version automatically. No stale advice.

---

## Part 2 — Instruction Files: Boundaries That Actually Work

### What are they?

Instruction files in `.github/instructions/` load automatically based on which file you are working on. The `applyTo` pattern controls when each file is active:

```
angular.instructions.md   → applyTo: src/**/*.ts
tailwind.instructions.md  → applyTo: src/**/*.html, src/**/*.css
testing.instructions.md   → applyTo: src/**/*.spec.ts
```

No need to repeat yourself in every chat. Copilot picks up the right context based on context.

### The key insight — instructions are not just for coding patterns

Most developers only put Angular syntax rules in their instruction files. But the real power is using them to define **boundaries** — rules about what Copilot should _not_ do. In the `angularTodo` project, the TailwindCSS instruction file (`tailwind.instructions.md`) enforces these non-coding constraints:

```markdown
## CSS Policy — Strict Boundaries

- **DO NOT add custom CSS, inline styles, or debug colors** unless explicitly
  requested by the user
- **DO NOT add positioning classes** (absolute, relative, fixed, sticky)
  unless specifically asked
- **DO NOT add debug borders, outlines, or bright background colors** for
  troubleshooting — ask instead of guessing
- When in doubt: use only existing TailwindCSS utilities already in the project
```

This eliminated an entire class of problems — Copilot was adding `!important` rules and neon debug backgrounds it thought were "helpful". One instruction file, problem gone permanently.

### Folder structure belongs in instructions too

One of the most impactful things you can do is tell Copilot exactly where things go. This single block, added to `angular.instructions.md`, made every generated file land in the right place:

```markdown
## Folder Structure — Always Follow This

src/app/
├── components/ ← Reusable UI components (todo-item/, modal/, shared/)
├── features/ ← Feature-specific pages (todo-list/, settings/)
├── services/ ← Business logic and HTTP services
├── interfaces/ ← TypeScript interfaces and models
├── guards/ ← Route guards
├── pipes/ ← Custom pipes
└── shared/ ← Utilities, constants, types

## Component Creation Rule

Every component MUST be created with exactly 4 files:

- component-name.component.ts → Logic, signals, DI
- component-name.component.html → Template, Angular control flow
- component-name.component.css → TailwindCSS classes only
- component-name.component.spec.ts → Vitest unit tests
```

Before adding this, Copilot was dropping files in the root `app/` folder. After adding it, every component lands exactly where it belongs — services in `services/`, interfaces in `interfaces/`, features in `features/`. The structure becomes self-enforcing.

### The Error Prevention Workflow

The instructions also tell Copilot to validate its own output:

```markdown
## Before Completing Any Task

1. Use get_errors to check for TypeScript and template compilation errors
2. Verify all imported pipes and directives are in the component's imports array
3. Confirm signal mutations use .set() or .update() — never direct mutation
4. Validate all @for loops have a track expression
```

This turned Copilot from "generates code that sometimes compiles" into "generates and validates before handing back".

---

## Part 3 — Skills: On-Demand Deep Expertise

### What are they?

Skills are specialist knowledge files loaded only when a task genuinely needs deep expertise. Unlike instructions (always on), a Skill is invoked explicitly. You create the file at `.github/skills/angular-expert/SKILL.md` and invoke it with `/angular-expert` in chat.

### When to use a Skill vs. an Instruction

| Situation                                      | Use         |
| ---------------------------------------------- | ----------- |
| Every `.ts` file should follow OnPush          | Instruction |
| Designing a signal store for a complex feature | Skill       |
| Always check for missing imports               | Instruction |
| Architecting SSR hydration for a full app      | Skill       |

### The angular-expert skill in this project

The skill in `angularTodo` covers:

- Signal-based state management patterns with private `#state`
- `takeUntilDestroyed` for automatic subscription cleanup
- SSR-safe patterns using `isPlatformBrowser`
- `@defer` blocks for lazy rendering
- CDK virtual scroll for large lists
- Comprehensive Vitest patterns for signal testing

```typescript
// Pattern the Skill always recommends for service state
@Injectable({ providedIn: 'root' })
export class TodoApiService {
  readonly #state = signal<State>({ todos: [], loading: false, error: null });

  readonly todos = computed(() => this.#state().todos);
  readonly isLoading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);

  // State mutations never expose WritableSignal externally
  private setState(patch: Partial<State>) {
    this.#state.update((s) => ({ ...s, ...patch }));
  }
}
```

This is the exact pattern used in `src/app/services/todo-api.service.ts` in the repo.

### How to invoke

In the VS Code Copilot chat panel, type:

```
/angular-expert  Design a signal store for a multi-step form with validation
```

Copilot loads the full SKILL.md and responds at architect level — not generic Angular advice.

---

## Part 4 — Agents: Reusable AI Teammates with Checklists

### What are they?

Agent `.md` files define specialized AI personas designed for repeatable workflows. They are not just prompts — they declare which tools Copilot is allowed to use, which skills to load, and what workflow to follow. The agent runs autonomously through a multi-step process.

### The code-reviewer agent in angularTodo

The project has `.github/agents/code-reviewer.agent.md` with **7 structured checklists**:

| Checklist                     | What it checks                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| 1 — Angular 21 Best Practices | Signals, OnPush, standalone, `input()`/`output()`, SSR guards                           |
| 2 — ES6+ & TypeScript         | Destructuring, spread/rest, `structuredClone`, no `.push()` on signals                  |
| 3 — Security (OWASP Top 10)   | XSS via `[innerHTML]`, hardcoded secrets, injection via string concat                   |
| 4 — Accessibility (WCAG AA)   | `aria-label`, `type="button"`, keyboard focus, colour contrast                          |
| 5 — Performance               | `NgOptimizedImage`, `@defer`, `track item.id`, `takeUntilDestroyed`, CDK virtual scroll |
| 6 — Common Developer Mistakes | Loop anti-patterns, 3+ if/else chains, magic numbers, signal mutation bugs              |
| 7 — Test Coverage             | `.spec.ts` for every component, signal state tested, HTTP calls mocked                  |

The agent's workflow starts with the MCP server — live Angular best practices are fetched before any file is read. Then it reads changed files, runs `get_errors`, and produces a structured report with severity levels:

```
🔴 CRITICAL  — Must fix before merge (SSR crash, XSS risk, type error)
🟡 WARNING   — Should fix (pattern violation, accessibility gap)
🔵 SUGGESTION — Consider improving (readability, performance hint)
```

### How to use it in normal chat — no special commands needed

This is the part most people miss. You do not need a special slash command. Just open VS Code Copilot chat, switch to **Agent mode** (the dropdown at the top of the chat panel), and select **"Code & PR Reviewer"** from the list.

Then write naturally:

```
Review the changes I made to todo-list.component.ts and todo-api.service.ts
```

The agent will:

1. Call `mcp_angular-cli_get_best_practices` for live Angular 21 guidelines
2. Use `get_changed_files` to discover what changed
3. Use `read_file` on each changed file
4. Run `get_errors` to catch compilation issues
5. Walk through all 7 checklists
6. Return a structured review with file paths, line numbers, and concrete fixes

You can also ask it mid-review:

```
Is the way I structured the signal state in TodoApiService following best practices?
```

The agent responds in context — it already read the file, it already fetched live guidelines, so the answer is specific to your exact code.

---

## The Complete Setup Flow

```
Step 1: Add .vscode/mcp.json
         ├─ @angular/mcp  → Live Angular CLI + docs
         ├─ @tailwindcss/mcp → Live Tailwind utilities
         └─ @nx/mcp → Workspace graph (for monorepos)

Step 2: Create .github/copilot-instructions.md
         └─ Stack info, non-negotiables, component creation rules, boundries, co-piolet instructions

Step 3: Add .github/instructions/*.instructions.md
         ├─ angular.instructions.md  → Coding patterns + folder structure
         ├─ tailwind.instructions.md → CSS boundaries (what NOT to add)
         └─ testing.instructions.md  → Vitest patterns + signal testing

Step 4: Create .github/skills/angular-expert/SKILL.md
         └─ Deep patterns: signal stores, SSR, CDK, testing

Step 5: Add .github/agents/code-reviewer.agent.md
         └─ 7-checklist PR reviewer, invoked from Agent mode in chat

Result: Copilot that behaves like a senior Angular architect 🎉
```

---

## Before vs After — Real Differences in This Project

| Without setup                           | With this setup                                          |
| --------------------------------------- | -------------------------------------------------------- |
| `*ngIf`, `*ngFor` (Angular 14 syntax)   | `@if`, `@for` every time                                 |
| `@Input()` decorators                   | `input()` / `output()` functions                         |
| Files dropped in `app/` root            | Correct folder every time (`components/`, `services/`)   |
| No `.spec.ts` generated                 | All 4 files created automatically                        |
| Debug borders and `!important` rules    | Clean TailwindCSS only                                   |
| Generic patterns, wrong Angular version | Live, version-matched Angular 21 patterns from MCP       |
| Manual PR review with missed issues     | Agent catches OWASP, accessibility, signal mutation bugs |

---

## Token Budgeting — The Cost Angle Nobody Talks About

This is the part that matters most in a business context, and it is almost never mentioned in tutorials.

Every time a developer interacts with GitHub Copilot, the AI model receives a **context window** — a fixed-size budget of tokens (words, roughly) that it can read before responding. That budget has to cover:

- The `copilot-instructions.md` file — **loaded on every single request**
- Any matching instruction files for the current file type
- Skills, if invoked
- The agent definition, if active
- The actual code Copilot is looking at
- The conversation history

**If you do not manage this deliberately, you waste the budget — and quality drops.**

### What happens without token budgeting

Without a structured setup, developers often paste large chunks of context manually, repeat the same framework rules in every prompt, or write long unstructured `copilot-instructions.md` files that bloat every interaction. In a team of 20 developers doing this 50 times a day, you are burning thousands of tokens on redundant context that a properly configured instruction file would handle in 200 tokens once.

The symptoms are subtle but real:

- Copilot "forgets" the code it was shown earlier in a long conversation
- Responses become more generic as the window fills up
- Multi-file tasks lose context halfway through
- Agents stop seeing full file contents and give partial reviews

### The layered architecture solves this by design

The setup in `angularTodo` is not just organised — it is deliberately token-efficient:

| Layer                     | Token cost                | When loaded                   | What to keep here                                        |
| ------------------------- | ------------------------- | ----------------------------- | -------------------------------------------------------- |
| `copilot-instructions.md` | Paid on **every** request | Always                        | Stack facts, non-negotiables only — keep under 200 lines |
| Instruction files         | Paid per matching file    | On file open/edit             | Targeted rules per file type — not global rules          |
| Skills                    | Paid only when invoked    | On-demand (`/angular-expert`) | Deep patterns that are rarely needed                     |
| Agents                    | Paid only in Agent mode   | On-demand (agent chat)        | Full workflows — checklists, tools, output format        |

```
copilot-instructions.md   → ~150 tokens  (loaded every time — keep lean)
angular.instructions.md   → ~400 tokens  (loaded only for *.ts files)
angular-expert SKILL.md   → ~800 tokens  (loaded only when invoked)
code-reviewer.agent.md    → ~1200 tokens (loaded only in Agent mode)

Unstructured prompt doing the same job:  ~3000+ tokens, every time, for every developer
```

### Practical rules for team leads and architects

- **`copilot-instructions.md` is not a wiki.** Keep it to stack facts and non-negotiables. Anything that only applies to `.ts` files goes in an instruction file, not here.
- **Use `applyTo` aggressively.** Each instruction file should target the narrowest possible file pattern so it is only loaded when relevant.
- **Skills are not always-on documentation.** If a pattern appears in every file, it belongs in an instruction. Skills are for architecture-level guidance invoked deliberately.
- **Agents are not chatbots.** Use them for repeatable, multi-step workflows (code review, refactoring passes, migration tasks) — not for one-off questions where a plain chat interaction is cheaper.
- **Review your instruction files quarterly.** As the codebase matures, old rules stay resident in the token budget even when they are no longer relevant. Trim them.

### The business case in one sentence

> A team of 10 Angular developers with a properly configured Copilot setup uses the same token budget per developer per day as an unconfigured team — but gets responses that are more accurate, more consistent, and grounded in the actual codebase rather than generic AI training data.

That is not a tooling improvement. That is a quality and velocity multiplier at scale.

---

## Resources

- 📖 [Full source — github.com/sudeep31/angularTodo](https://github.com/sudeep31/angularTodo)
- 📖 [GitHub Copilot Customization Docs](https://docs.github.com/en/copilot/customizing-copilot)
- 📖 [Angular MCP Server — @angular/mcp](https://www.npmjs.com/package/@angular/mcp)
- 📖 [MCP Protocol Spec](https://modelcontextprotocol.io/)
- 📖 [VS Code Agent Mode Docs](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode)

---

**#Angular #GitHub #Copilot #AI #WebDevelopment #SolutionArchitect #DeveloperExperience #TypeScript #SoftwareArchitecture #TailwindCSS**
