---
name: store-gen
description: Generate state management stores using Zustand, Redux Toolkit, Context API, or Jotai. Creates stores with TypeScript types, persistence, middleware, and selectors. Use when creating global state, adding state management, or when user mentions "create store", "global state", "Zustand", "Redux", "Context", "state management", "persist state", or needs state management setup.
---

# State Management Generator Skill

Generate type-safe state management solutions for React applications. Supports multiple state management libraries and patterns.

## When to Use This Skill

- Creating global state stores
- Setting up state management
- Adding state persistence
- Creating store slices/modules
- Adding middleware (logging, devtools)
- Migrating between state libraries
- Setting up selectors
- Adding async actions

## Initial Setup: Detect State Management

### Step 1: Detect Library

Check `package.json` for:
- **Zustand**: `zustand` (lightweight, recommended)
- **Redux Toolkit**: `@reduxjs/toolkit`
- **Jotai**: `jotai` (atomic state)
- **Recoil**: `recoil`
- **MobX**: `mobx`, `mobx-react-lite`
- **Context API**: Built-in React (no deps)

### Step 2: Detect Patterns

Look for existing stores:
- File location (`stores/`, `state/`, `atoms/`)
- Naming conventions
- Persistence strategy
- Middleware usage

### Step 3: Document Setup

```
State management:
- Library: Zustand
- Location: src/stores/
- Persistence: localStorage
- Devtools: Enabled
- TypeScript: Yes
```

## Zustand Pattern (Recommended)

### Basic Store

**stores/counter-store.ts**:
```typescript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  setCount: (count: number) => void
}

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (count) => set({ count }),
}))
```

**Usage**:
```typescript
'use client'

import { useCounterStore } from '@/stores/counter-store'

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

### Store with Persistence

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Store with Devtools

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TodoState {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  removeTodo: (id: string) => void
  toggleTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>()(
  devtools(
    (set) => ({
      todos: [],
      addTodo: (todo) =>
        set((state) => ({ todos: [...state.todos, todo] }), false, 'addTodo'),
      removeTodo: (id) =>
        set(
          (state) => ({ todos: state.todos.filter((t) => t.id !== id) }),
          false,
          'removeTodo'
        ),
      toggleTodo: (id) =>
        set(
          (state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            ),
          }),
          false,
          'toggleTodo'
        ),
    }),
    { name: 'TodoStore' }
  )
)
```

### Store with Async Actions

```typescript
import { create } from 'zustand'

interface Product {
  id: string
  name: string
  price: number
}

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/products')
      const products = await response.json()
      set({ products, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const newProduct = await response.json()
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
}))
```

### Selectors

```typescript
// Inline selectors
const count = useCounterStore((state) => state.count)
const increment = useCounterStore((state) => state.increment)

// Computed selectors
const useCompletedTodos = () =>
  useTodoStore((state) => state.todos.filter((t) => t.completed))

const usePendingTodos = () =>
  useTodoStore((state) => state.todos.filter((t) => !t.completed))

// With equality function
import { shallow } from 'zustand/shallow'

const { count, increment } = useCounterStore(
  (state) => ({ count: state.count, increment: state.increment }),
  shallow
)
```

### Store Slices (Large Store)

```typescript
// slices/cart-slice.ts
export interface CartSlice {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const createCartSlice = (set: any): CartSlice => ({
  items: [],
  addItem: (item) =>
    set((state: any) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state: any) => ({
      items: state.items.filter((i: CartItem) => i.id !== id),
    })),
  clearCart: () => set({ items: [] }),
})

// slices/user-slice.ts
export interface UserSlice {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

// Combined store
import { create } from 'zustand'
import { createCartSlice, type CartSlice } from './slices/cart-slice'
import { createUserSlice, type UserSlice } from './slices/user-slice'

type StoreState = CartSlice & UserSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createCartSlice(...a),
  ...createUserSlice(...a),
}))
```

## Redux Toolkit Pattern

### Configuration

**store/index.ts**:
```typescript
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counter-slice'
import userReducer from './slices/user-slice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**store/hooks.ts**:
```typescript
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### Slice

**store/slices/counter-slice.ts**:
```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
export default counterSlice.reducer
```

### Async Thunk

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }
)

interface UserState {
  data: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.data = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user'
      })
  },
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
```

**Usage**:
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUser } from '@/store/slices/user-slice'

export function UserProfile() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchUser('123'))
  }, [dispatch])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <div>{data?.name}</div>
}
```

## Context API Pattern

```typescript
// contexts/theme-context.tsx
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

## Jotai Pattern

```typescript
// atoms/counter-atom.ts
import { atom } from 'jotai'

export const countAtom = atom(0)

export const doubleCountAtom = atom((get) => get(countAtom) * 2)

export const incrementAtom = atom(
  null,
  (get, set) => set(countAtom, get(countAtom) + 1)
)
```

**Usage**:
```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { countAtom, doubleCountAtom, incrementAtom } from '@/atoms/counter-atom'

export function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const doubleCount = useAtomValue(doubleCountAtom)
  const increment = useSetAtom(incrementAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

## Advanced Patterns

### Immer Middleware (Zustand)

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface TodoState {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
}

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    addTodo: (todo) =>
      set((state) => {
        state.todos.push(todo)
      }),
    updateTodo: (id, updates) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id)
        if (todo) {
          Object.assign(todo, updates)
        }
      }),
  }))
)
```

### Subscriptions (Zustand)

```typescript
// Subscribe to changes
const unsubscribe = useCounterStore.subscribe(
  (state) => state.count,
  (count) => console.log('Count changed:', count)
)

// Cleanup
unsubscribe()
```

### Computed Values

```typescript
interface CartState {
  items: CartItem[]
  // ... actions
}

// Selector outside component
export const selectTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

// Usage
const total = useCartStore(selectTotal)
```

### Resetting Store

```typescript
const initialState = {
  count: 0,
  name: '',
}

export const useStore = create<State>()((set) => ({
  ...initialState,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set(initialState),
}))
```

## Best Practices

1. **Keep stores focused**: One store per domain
2. **Use selectors**: Avoid unnecessary re-renders
3. **Immutable updates**: Never mutate state directly (unless using Immer)
4. **TypeScript types**: Always type your stores
5. **Persist wisely**: Only persist what's needed
6. **Async patterns**: Handle loading and errors
7. **Devtools**: Use for debugging
8. **Test stores**: Test actions and selectors
9. **Avoid prop drilling**: Use stores for deeply nested props
10. **Co-locate**: Keep related logic together

## Common Patterns

### Auth Store

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        const { user, token } = await response.json()
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshToken: async () => {
        const response = await fetch('/api/auth/refresh')
        const { token } = await response.json()
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
```

### Modal Store

```typescript
interface ModalState {
  isOpen: boolean
  type: 'confirm' | 'alert' | 'custom' | null
  props: Record<string, any>
  open: (type: ModalState['type'], props?: Record<string, any>) => void
  close: () => void
}

export const useModalStore = create<ModalState>()((set) => ({
  isOpen: false,
  type: null,
  props: {},
  open: (type, props = {}) => set({ isOpen: true, type, props }),
  close: () => set({ isOpen: false, type: null, props: {} }),
}))
```

### Loading Store

```typescript
interface LoadingState {
  tasks: Set<string>
  isLoading: (taskId?: string) => boolean
  startLoading: (taskId: string) => void
  stopLoading: (taskId: string) => void
}

export const useLoadingStore = create<LoadingState>()((set, get) => ({
  tasks: new Set(),
  
  isLoading: (taskId) => {
    if (!taskId) return get().tasks.size > 0
    return get().tasks.has(taskId)
  },
  
  startLoading: (taskId) =>
    set((state) => ({ tasks: new Set([...state.tasks, taskId]) })),
  
  stopLoading: (taskId) =>
    set((state) => {
      const tasks = new Set(state.tasks)
      tasks.delete(taskId)
      return { tasks }
    }),
}))
```

## Tips for Success

- Choose the right tool for job size
- Start simple, add complexity as needed
- Keep global state minimal
- Use local state when possible
- Document your stores
- Test store logic separately
- Use devtools for debugging
- Persist only necessary data
- Handle async errors properly
- Consider server state vs client state

Remember: Not all state needs to be global. Use global state for truly shared data across components.
