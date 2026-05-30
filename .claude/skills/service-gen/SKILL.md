---
name: service-gen
description: Generate, audit, and maintain API services and data-fetching hooks for React/Next.js projects. Supports TanStack Query, SWR, RTK Query, and custom patterns. Use when creating API endpoints, generating service hooks, adding React Query/SWR integration, or when user mentions "create service", "add API", "generate hook", "useQuery", "service layer", or wants to work with API/service layers. Also use when auditing existing services for consistency, type safety, or best practices.
---

# Service & Hook Generator Skill

This skill helps you create and maintain API services and their corresponding data-fetching hooks for React/Next.js projects. It adapts to your project's patterns and supports multiple data-fetching libraries.

## When to Use This Skill

- Creating new API service
- Generating data-fetching hooks (React Query, SWR, etc.)
- Adding API endpoints or integrations
- Questions about service layer, API calls, useQuery, React Query, SWR
- Auditing services for consistency
- Working with API/service directories
- Adding query keys or refetch logic

## Initial Setup: Detect Project Patterns

Before generating code, understand the project's architecture:

### Step 1: Find Service Directory

Look for common patterns:
- `src/service/` or `src/services/`
- `src/api/` or `src/apis/`
- `src/lib/api/`
- `app/api/` (Next.js API routes - different pattern)

### Step 2: Detect Data-Fetching Library

Check `package.json` for:
- **TanStack Query** (React Query): `@tanstack/react-query`
- **SWR**: `swr`
- **RTK Query**: `@reduxjs/toolkit` with query
- **Apollo Client**: `@apollo/client` (GraphQL)
- **Custom hooks**: Check existing hook patterns

### Step 3: Detect HTTP Client

Check what's used for requests:
- **Axios**: `axios` in package.json
- **Fetch API**: Native browser fetch
- **ky**: `ky` package
- **Custom wrapper**: Check existing services

### Step 4: Detect Type System

- **TypeScript**: `.ts/.tsx` files, `tsconfig.json`
- **JavaScript**: `.js/.jsx` files
- **JSDoc**: Comments for types in JS files

### Step 5: Detect Project Conventions

**Service patterns**:
```typescript
// Object pattern (common)
export const userService = {
  getUser: async (id) => { ... },
  createUser: async (data) => { ... }
}

// Class pattern
export class UserService {
  async getUser(id) { ... }
}

// Function exports
export async function getUser(id) { ... }
```

**Hook patterns**:
```typescript
// Separate hook files
src/hooks/useUser.ts
src/hooks/api/useUser.ts

// Colocated with service
src/services/user/hooks.ts
```

**Import paths**: Check `tsconfig.json`/`jsconfig.json`
- Path aliases: `@/`, `~/`, `@api/`, `@services/`
- Relative imports

### Step 6: Check Constants/Config

Look for:
- API base URL configuration
- Route constants file
- Environment variables pattern
- Error handling setup

### Step 7: Document Findings

```
Project setup:
- Data fetching: TanStack Query v5
- HTTP client: Axios with interceptors
- Service dir: src/service/
- Hook dir: src/hooks/service/
- Types: TypeScript
- Import alias: @/ → src/
- API routes: Defined in src/constants/api-routes.ts
- Base URL: Environment variable NEXT_PUBLIC_API_URL
```

## Core Patterns by Library

### TanStack Query (React Query)

**Service file** (`src/service/{domain}.ts`):
```typescript
import axios from 'axios'
import { API_BASE } from '@/config'

export const userService = {
  async getUser(
    id: string,
    signal?: AbortSignal
  ): Promise<User> {
    const { data } = await axios.get(
      `${API_BASE}/users/${id}`,
      { signal }
    )
    return data
  },
  
  async getUsers(
    params?: UserFilters,
    signal?: AbortSignal
  ): Promise<User[]> {
    const { data } = await axios.get(
      `${API_BASE}/users`,
      { params, signal }
    )
    return data
  },
  
  async createUser(payload: CreateUserDto): Promise<User> {
    const { data } = await axios.post(`${API_BASE}/users`, payload)
    return data
  }
}
```

**Hook file** (`src/hooks/useUser.ts`):
```typescript
'use client' // If Next.js

import { userService } from '@/service/user'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query Keys Factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Queries
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => userService.getUser(id, signal),
    enabled: enabled && !!id,
  })
}

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: ({ signal }) => userService.getUsers(filters, signal),
  })
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
```

### SWR

**Service file** (same as above):
```typescript
export const userService = {
  async getUser(id: string): Promise<User> {
    const { data } = await axios.get(`${API_BASE}/users/${id}`)
    return data
  }
}
```

**Hook file** (`src/hooks/useUser.ts`):
```typescript
'use client'

import { userService } from '@/service/user'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

// Keys
export const userKeys = {
  user: (id: string) => ['users', id] as const,
  users: (filters?: UserFilters) => ['users', filters] as const,
}

// Queries
export function useUser(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {}
  
  return useSWR(
    enabled && id ? userKeys.user(id) : null,
    () => userService.getUser(id),
    {
      revalidateOnFocus: false,
    }
  )
}

export function useUsers(filters?: UserFilters) {
  return useSWR(
    userKeys.users(filters),
    () => userService.getUsers(filters)
  )
}

// Mutations
export function useCreateUser() {
  return useSWRMutation(
    userKeys.users(),
    (_, { arg }: { arg: CreateUserDto }) => userService.createUser(arg)
  )
}
```

### Native Fetch (No Library)

**Service file**:
```typescript
export const userService = {
  async getUser(id: string, signal?: AbortSignal): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, { signal })
    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  },
  
  async createUser(payload: CreateUserDto): Promise<User> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  }
}
```

**Hook file** (custom hooks):
```typescript
'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/service/user'

export function useUser(id: string) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()
    
    userService.getUser(id, controller.signal)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [id])

  return { data, loading, error }
}
```

## Type Patterns

### TypeScript

**API Response wrapper**:
```typescript
// Generic wrapper (if backend returns consistent structure)
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Or return data directly (simpler)
export type UserResponse = User
```

**Payload/Params types**:
```typescript
// Request payloads
export interface CreateUserPayload {
  name: string
  email: string
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string
}

// URL parameters
export interface UserParams {
  id: string
}

// Query parameters
export interface UserFilters {
  role?: string
  status?: 'active' | 'inactive'
  page?: number
}
```

**Type organization**:
```
src/types/
├── api.ts           # Generic API types
├── user.ts          # User domain types
├── product.ts       # Product domain types
└── index.ts         # Barrel exports
```

### JavaScript (with JSDoc)

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} name
 * @property {string} email
 */

/**
 * Get user by ID
 * @param {string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<User>}
 */
export async function getUser(id, signal) {
  // ...
}
```

## HTTP Client Patterns

### Axios with Interceptors

**Setup** (`src/lib/axios.ts`):
```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

**Usage in service**:
```typescript
import apiClient from '@/lib/axios'

export const userService = {
  async getUser(id: string, signal?: AbortSignal) {
    const { data } = await apiClient.get(`/users/${id}`, { signal })
    return data
  }
}
```

### Fetch with Wrapper

**Setup** (`src/lib/fetch.ts`):
```typescript
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}
```

**Usage**:
```typescript
export const userService = {
  async getUser(id: string, signal?: AbortSignal) {
    return apiFetch<User>(`/users/${id}`, { signal })
  }
}
```

## Advanced Patterns

### Query Keys Strategy (TanStack Query)

**Hierarchical keys for cache invalidation**:
```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all })

// Invalidate all user lists
queryClient.invalidateQueries({ queryKey: userKeys.lists() })

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
```

### Polling with Conditional Stop

```typescript
export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId, 'status'],
    queryFn: ({ signal }) => orderService.getStatus(orderId, signal),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Stop polling when completed or failed
      if (status === 'completed' || status === 'failed') {
        return false
      }
      return 3000 // Poll every 3 seconds
    },
  })
}
```

### Optimistic Updates

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.updateUser,
    onMutate: async (updatedUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(updatedUser.id) })
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(userKeys.detail(updatedUser.id))
      
      // Optimistically update
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
      
      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        userKeys.detail(variables.id),
        context?.previous
      )
    },
    onSettled: (data, error, variables) => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}
```

### Dependent Queries

```typescript
export function useUserWithPosts(userId: string) {
  const userQuery = useUser(userId)
  
  const postsQuery = useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: ({ signal }) => postService.getUserPosts(userId, signal),
    enabled: !!userQuery.data, // Only fetch posts after user loads
  })
  
  return {
    user: userQuery.data,
    posts: postsQuery.data,
    isLoading: userQuery.isLoading || postsQuery.isLoading,
  }
}
```

### Pagination

```typescript
export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: userKeys.list({ page, pageSize }),
    queryFn: ({ signal }) => 
      userService.getUsers({ page, pageSize }, signal),
    keepPreviousData: true, // Keep old data while fetching new page
  })
}
```

### Infinite Scroll

```typescript
export function useInfiniteUsers(filters?: UserFilters) {
  return useInfiniteQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: ({ pageParam = 1, signal }) =>
      userService.getUsers({ ...filters, page: pageParam }, signal),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined
    },
  })
}
```

## Service Generation Workflow

### Step 1: Understand Requirements

Ask:
1. What is the domain/resource? (users, products, orders, etc.)
2. What operations? (CRUD, specific actions)
3. What are the endpoint URLs?
4. Any special requirements? (polling, pagination, auth)
5. What data-fetching library is used?

### Step 2: Check Existing Code

1. Find similar services to match patterns
2. Check if types exist
3. Check API route constants
4. Review HTTP client setup

### Step 3: Generate Service File

Create service with methods for each operation:
- Match existing file/function naming patterns
- Use project's HTTP client
- Include proper TypeScript types
- Add AbortSignal support for cancellation
- Follow error handling patterns

### Step 4: Generate Hook File

Create hooks based on data-fetching library:
- TanStack Query: useQuery/useMutation
- SWR: useSWR/useSWRMutation
- Custom: useState/useEffect patterns

Include:
- Query keys (if applicable)
- Proper enabled logic
- Signal passing for cancellation
- Cache invalidation (mutations)

### Step 5: Update Exports

Update barrel exports if project uses them:
```typescript
// src/service/index.ts
export * from './user'
export * from './product'

// src/hooks/index.ts
export * from './useUser'
export * from './useProduct'
```

## Audit Checklist

### Service File

- [ ] ✅ Consistent with project patterns (object/class/functions)
- [ ] ✅ Uses project's HTTP client correctly
- [ ] ✅ All methods are async (if applicable)
- [ ] ✅ Proper return types
- [ ] ✅ AbortSignal support for GET requests
- [ ] ✅ Uses constants for URLs (not hardcoded)
- [ ] ✅ Proper error handling
- [ ] ✅ TypeScript types or JSDoc comments
- [ ] ✅ No sensitive data in code

### Hook File

- [ ] ✅ Uses correct data-fetching library
- [ ] ✅ Query keys are consistent (if TanStack Query)
- [ ] ✅ Passes signal to service methods
- [ ] ✅ Proper enabled logic
- [ ] ✅ Cache invalidation on mutations
- [ ] ✅ Hook names follow convention
- [ ] ✅ Exports types/interfaces
- [ ] ✅ 'use client' directive (if Next.js)

### Common Issues

**Service**:
- ❌ Missing AbortSignal parameter
- ❌ Hardcoded URLs
- ❌ Using `any` type
- ❌ Not handling errors
- ❌ Mixing concerns (business logic in service)

**Hooks**:
- ❌ Not passing signal to service
- ❌ Missing enabled logic for conditional queries
- ❌ Not invalidating cache on mutations
- ❌ Hardcoded query keys
- ❌ Missing 'use client' (Next.js)

## Framework-Specific Notes

### Next.js

**App Router (13+)**:
- Use `'use client'` for hooks
- Server Components can call services directly
- API routes in `app/api/` are separate from frontend services

**Pages Router**:
- Hooks in components
- API routes in `pages/api/`

### React + Vite/CRA

- Standard React hooks patterns
- No special directives needed

### Remix

- Use loaders/actions instead of hooks for data fetching
- Services called in loader functions
- useLoaderData in components

## Adaptation Strategy

1. **Scan existing code**: Read 2-3 services to understand patterns
2. **Check package.json**: Identify libraries
3. **Document conventions**: HTTP client, data fetching, file structure
4. **Ask if unclear**: "I see multiple patterns. Which should I follow?"
5. **Stay consistent**: Match existing code even if not ideal
6. **Suggest improvements**: Point out inconsistencies diplomatically

## Common User Requests

- "Create a service for X" → Generate service + hooks
- "Add API endpoint for Y" → Add method to existing service
- "This API isn't working" → Audit and fix
- "Add polling" → Add refetchInterval logic
- "Check service patterns" → Full audit
- "Support pagination" → Add pagination pattern

Remember: Adapt to each project's unique patterns while maintaining best practices for the chosen stack and libraries.
