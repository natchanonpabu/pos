---
name: feature-arch
description: Scaffold, audit, and refactor React feature components following Atomic Design pattern (atoms/molecules/organisms/templates). Use when creating new features, checking component hierarchy, organizing components, or when user mentions "feature architecture", "atomic design", "scaffold feature", "component structure", or wants to create/reorganize feature components. Works with React, Next.js, and other component-based frameworks.
---

# Feature Architecture Skill

This skill helps you work with React feature components using Atomic Design principles. It can scaffold new features, audit existing ones, and refactor components into the proper hierarchy. The skill adapts to your project's conventions.

## Atomic Design Overview

Atomic Design organizes components into four levels:

```
components/feature/{feature-name}/
├── atoms/          # Basic presentational components
│   ├── component-name.tsx
│   └── index.ts
├── molecules/      # Compositions of atoms
│   ├── component-name.tsx
│   └── index.ts
├── organisms/      # Complex sections
│   ├── section-name.tsx
│   └── index.ts
├── template/       # Page-level layout
│   └── feature-template.tsx
└── types.ts        # Shared TypeScript types
```

## When to Use This Skill

- Creating new feature component structure
- Scaffolding, generating, or setting up a feature
- Questions about "atomic design", "component hierarchy", or "feature architecture"
- Auditing if components are in the right place
- Refactoring/reorganizing components between levels
- Working with feature components directory

## Initial Setup: Detect Project Structure

Before working, detect the project's conventions:

### Step 1: Find Components Directory

Look for common patterns:
- `src/components/feature/` or `src/components/features/`
- `components/feature/` or `components/features/`
- `app/components/feature/`
- Custom location (ask user if not found)

### Step 2: Detect Conventions

**File extensions**: Check what the project uses
- `.tsx` vs `.jsx` (TypeScript vs JavaScript)
- `.ts` vs `.js` for types

**Naming conventions**: Read existing features
- `kebab-case` vs `camelCase` vs `PascalCase` for files
- Component naming patterns
- Index file patterns (`index.ts` vs `index.tsx`)

**Framework detection**:
- Next.js: Look for `next.config.*`, check for `'use client'` directives
- React: Check `package.json` for `react` version
- Vite: Look for `vite.config.*`

**Style system**: Check `package.json` and existing components
- Tailwind CSS
- Styled-components
- Emotion
- CSS Modules
- Material-UI or other component library

**Import paths**: Check `tsconfig.json` or `jsconfig.json`
- Path aliases (e.g., `@/`, `~/`, `@components/`)
- Relative vs absolute imports

### Step 3: Document Findings

Summarize detected conventions:
```
Project conventions:
- Components dir: src/components/feature/
- File extension: .tsx (TypeScript)
- Naming: kebab-case files, PascalCase components
- Framework: Next.js 15 with App Router
- Styles: Tailwind CSS + Material-UI
- Import alias: @/ → src/
- Client directive: Required for interactive components
```

## Core Tasks

### 1. Scaffolding New Features

When creating a new feature:

**1. Create directory structure**:
```bash
mkdir -p {components-dir}/feature/{feature-name}/{atoms,molecules,organisms,template}
```

**2. Generate types file** (if project uses TypeScript):
```typescript
// types.ts or type.ts
export interface {FeatureName}Props {
  // Add props based on requirements
}

export interface {FeatureName}Data {
  // Add data structures
}
```

**3. Create index files** for each level:
```typescript
// atoms/index.ts, molecules/index.ts, organisms/index.ts
export { ComponentName } from './component-name'
```

**4. Generate template component**:

**Next.js with 'use client'**:
```typescript
'use client'

import { /* organisms */ } from '../organisms'

export const {FeatureName}Template = () => {
  return (
    <div>
      {/* Compose organisms here */}
    </div>
  )
}
```

**Standard React**:
```typescript
import { /* organisms */ } from '../organisms'

export const {FeatureName}Template = () => {
  return (
    <div>
      {/* Compose organisms here */}
    </div>
  )
}
```

**Key principles**:
- Adapt to project's file naming convention
- Use detected style system (Tailwind classes, styled-components, etc.)
- Follow import path patterns (alias vs relative)
- Templates compose organisms, not atoms/molecules directly

### 2. Auditing Features

Check if a feature follows proper Atomic Design:

**Required structure**:
- [ ] All four directories exist (atoms, molecules, organisms, template)
- [ ] Each directory has proper export file (index.ts/tsx)
- [ ] Feature has types file (if TypeScript project)
- [ ] Template file exists

**Component hierarchy rules**:
- [ ] **Atoms**: Only import from shared components, types, constants, utilities. NEVER import molecules/organisms/template.
- [ ] **Molecules**: Can import atoms and shared components. NEVER import organisms/template.
- [ ] **Organisms**: Can import molecules, atoms, and shared components. NEVER import template.
- [ ] **Template**: Can import organisms, molecules, atoms, and shared components.

**Anti-patterns to flag**:
- Atoms importing molecules/organisms (breaks Atomic Design)
- Molecules importing organisms (breaks hierarchy)
- Missing export files (makes imports messy)
- Template without proper client directive (if Next.js)
- Complex logic in atoms (should be presentational)

### 3. Refactoring Components

**Decision criteria**:

**Atom**:
- Single responsibility, highly reusable
- Presentational only (minimal logic)
- Examples: buttons, badges, icons, labels
- Only imports types and shared utilities

**Molecule**:
- Composes 2-3 atoms into functional unit
- Has internal logic and state
- Examples: search bar (input + button), card (image + text + badge)
- Imports atoms and shared components

**Organism**:
- Complete section of UI
- Composes multiple molecules/atoms
- May fetch data or use hooks
- Examples: navigation bar, form section, list of cards
- Imports molecules, atoms, shared components

**Template**:
- Full page layout
- Composes organisms into page structure
- May use client directive (Next.js) or data fetching
- Handles page-level concerns
- Imports organisms and layout components

**Refactoring steps**:
1. Identify component's actual complexity level
2. Check what it imports (reveals true dependencies)
3. Move to appropriate directory
4. Update imports throughout codebase
5. Update export files (index.ts)

## Code Generation Patterns

Adapt these patterns to project conventions:

### Atom Template

**TypeScript with Tailwind**:
```typescript
interface {AtomName}Props {
  // Props here
}

export const {AtomName} = ({ ...props }: {AtomName}Props) => {
  return (
    <div className="...">
      {/* Simple JSX */}
    </div>
  )
}
```

**JavaScript**:
```jsx
export const {AtomName} = ({ ...props }) => {
  return (
    <div>
      {/* Simple JSX */}
    </div>
  )
}
```

### Molecule Template

**With State**:
```typescript
'use client' // If Next.js and needs interactivity

import { useState } from 'react'
import { AtomA, AtomB } from '../atoms'

interface {MoleculeName}Props {
  // Props here
}

export const {MoleculeName} = ({ ...props }: {MoleculeName}Props) => {
  const [state, setState] = useState()
  
  return (
    <div>
      {/* Compose atoms */}
    </div>
  )
}
```

### Organism Template

**With Data Fetching (if using React Query/SWR)**:
```typescript
'use client'

import { MoleculeA, MoleculeB } from '../molecules'
import { AtomX } from '../atoms'

interface {OrganismName}Props {
  // Props here
}

export const {OrganismName} = ({ ...props }: {OrganismName}Props) => {
  // Data fetching, complex state
  
  return (
    <section>
      {/* Compose molecules/atoms */}
    </section>
  )
}
```

### Template Template

Adapt based on framework:

**Next.js App Router**:
```typescript
'use client'

import { OrganismA, OrganismB } from '../organisms'

export const {FeatureName}Template = () => {
  return (
    <main>
      <OrganismA />
      <OrganismB />
    </main>
  )
}
```

**Standard React**:
```typescript
import { OrganismA, OrganismB } from '../organisms'

export const {FeatureName}Template = () => {
  return (
    <div className="feature-container">
      <OrganismA />
      <OrganismB />
    </div>
  )
}
```

## Import Path Standards

Detect and use project's import pattern:

**With path alias** (tsconfig paths):
```typescript
// Shared components
import { Button } from '@/components/shared'
import { useCustomHook } from '@/hooks'

// Within same feature (relative)
import { AtomName } from '../atoms'
import { MoleculeName } from '../molecules'
import { type FeatureData } from '../types'
```

**Without alias** (relative paths):
```typescript
// Shared components
import { Button } from '../../shared'

// Within same feature
import { AtomName } from '../atoms'
import { type FeatureData } from '../types'
```

**Best practice**: Keep features isolated. If multiple features need the same component, move it to shared components.

## Enforcement Strategy

When auditing or refactoring:

1. **Read component file** and check imports
2. **Verify import hierarchy**:
   - If atom imports molecule → VIOLATION
   - If molecule imports organism → VIOLATION
3. **Check complexity match**:
   - If atom has useState/useEffect/data fetching → suggest molecule/organism
   - If molecule wraps single atom → suggest moving to atoms
4. **Suggest fixes with reasoning**:
   - "Component X imports from molecules but lives in atoms. Move to molecules because it composes multiple atoms."
   - "Component Y fetches data but lives in molecules. Move to organisms since it has complex logic."

## Workflow Examples

### Example 1: Scaffold New Feature

```bash
# Detect project structure first
ls src/components/feature/  # Find where features live

# Create structure
mkdir -p src/components/feature/user-profile/{atoms,molecules,organisms,template}

# Generate files based on detected conventions
# - Create types.ts with interfaces
# - Create index.ts in each level
# - Create template component
# - Generate starter atoms based on requirements
```

### Example 2: Audit Existing Feature

```bash
# Check structure
ls src/components/feature/dashboard/

# Check imports in each level
grep -r "from.*molecules\|from.*organisms" src/components/feature/dashboard/atoms/

# Flag violations and suggest fixes
```

### Example 3: Refactor Component

```typescript
// If UserCard in molecules/ fetches data and has complex logic:
// 1. Move to organisms/
mv src/components/feature/user/molecules/user-card.tsx \
   src/components/feature/user/organisms/user-card.tsx

// 2. Update molecules/index.ts (remove export)
// 3. Update organisms/index.ts (add export)
// 4. Update all imports in template and other components
```

## Framework-Specific Considerations

### Next.js

**App Router (13+)**:
- Templates usually need `'use client'` for interactivity
- Server components (organisms/molecules) can fetch data directly
- Client components need `'use client'` directive

**Pages Router**:
- Templates are typically page components
- Use getServerSideProps or getStaticProps for data

### React + Vite/CRA

- No special client directives needed
- Data fetching via React Query, SWR, or native fetch
- Templates are typically route components

### Remix

- Templates might be route components with loader functions
- Organisms can use useLoaderData

### React Native

- Different component primitives (View, Text instead of div, span)
- StyleSheet instead of CSS
- Adapt atom/molecule patterns to native components

## Adaptation Strategy

When starting work in a new project:

1. **Scan first**: Read 2-3 existing features to understand patterns
2. **Document conventions**: File naming, imports, styles, framework specifics
3. **Ask if unclear**: "I see you use Tailwind for atoms but styled-components for organisms. Should I follow this pattern?"
4. **Be consistent**: Match existing code style even if not your preference
5. **Suggest improvements**: If you notice inconsistencies, point them out

## Tips for Success

1. **Always detect first**: Don't assume conventions. Read existing code.

2. **Ask before generating**: If request is vague, ask about components needed, data requirements, interactions.

3. **Enforce hierarchy**: Be strict about import violations. Explain WHY rules exist.

4. **Generate realistic code**: Don't create empty files. Generate starter components with proper structure.

5. **Update exports**: Always update index files when adding/moving components.

6. **Consider shared components**: If component is used by multiple features, suggest moving to shared.

7. **Follow detected style**: Match the project's code style, import patterns, naming conventions.

8. **Framework-aware**: Adapt patterns to Next.js, React, Remix, etc.

9. **Type safety**: If TypeScript project, generate proper types. If JavaScript, skip type annotations.

10. **Test imports**: After generating, verify import paths work with project's configuration.

## Common User Requests

- "Create a new feature for X" → Detect conventions, scaffold structure
- "Is this component in the right place?" → Audit and suggest
- "How should I organize these components?" → Analyze and refactor
- "Generate a feature structure" → Scaffold with boilerplate
- "Check if my feature follows atomic design" → Full audit
- "This atom is too complex" → Suggest moving to molecule/organism
- "Where does this component go?" → Analyze and place appropriately

## Integration Notes

- **With service generators**: When creating features that need data, coordinate with service/API generation skills
- **With testing tools**: After generating components, suggest adding tests
- **With storybook**: If project uses Storybook, mention adding stories for new components

Remember: The goal is to maintain a clean, scalable architecture that follows Atomic Design principles while adapting to each project's unique conventions and constraints.
