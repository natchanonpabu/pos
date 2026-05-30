---
name: auth-pattern
description: Setup authentication patterns for React/Next.js applications including token management, refresh logic, protected routes, role-based access control (RBAC), and auth providers. Supports JWT, OAuth, session-based auth. Use when setting up authentication, adding protected routes, implementing token refresh, or when user mentions "auth", "authentication", "login", "protected route", "RBAC", "role guard", "token refresh", or needs auth system.
---

# Authentication Patterns Skill

Implement secure, production-ready authentication patterns for React/Next.js applications. Handles token management, refresh logic, protected routes, and role-based access control.

## When to Use This Skill

- Setting up authentication system
- Implementing login/logout
- Adding token refresh logic
- Creating protected routes
- Implementing RBAC (Role-Based Access Control)
- Setting up OAuth integration
- Adding auth interceptors
- Creating auth context/provider

## Initial Setup: Detect Auth Strategy

### Step 1: Detect Framework

- **Next.js App Router**: Server Components + middleware
- **Next.js Pages Router**: getServerSideProps
- **React SPA**: Client-side only

### Step 2: Detect Auth Library

Check `package.json`:
- **NextAuth.js**: `next-auth` (Next.js specific)
- **Auth0**: `@auth0/auth0-react`
- **Firebase Auth**: `firebase`
- **Clerk**: `@clerk/nextjs`
- **Custom**: JWT with manual implementation

### Step 3: Detect Token Storage

- **Cookies**: httpOnly, secure
- **localStorage**: Client-side
- **sessionStorage**: Session only
- **Memory**: No persistence

### Step 4: Document Setup

```
Auth setup:
- Strategy: JWT with refresh token
- Framework: Next.js App Router
- Storage: httpOnly cookies
- Refresh: Automatic via interceptor
- Protected: Middleware-based
- RBAC: Role checks in middleware
```

## JWT Authentication Pattern

### Token Types

**Access Token**: Short-lived (15 min), used for API calls
**Refresh Token**: Long-lived (7 days), used to get new access token

### Auth Store (Zustand)

**stores/auth-store.ts**:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          
          if (response.ok) {
            const user = await response.json()
            set({ user, isAuthenticated: true })
          } else {
            get().logout()
          }
        } catch (error) {
          get().logout()
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
```

### Axios Interceptor with Token Refresh

**lib/axios.ts**:
```typescript
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track refresh status
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Mark as retried
    originalRequest._retry = true

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    // Start refresh process
    isRefreshing = true

    try {
      const { refreshToken } = useAuthStore.getState()
      
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      // Call refresh endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken }
      )

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data

      // Update tokens in store
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)

      // Update original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      // Notify queued requests
      onTokenRefreshed(newAccessToken)

      // Retry original request
      return apiClient(originalRequest)
    } catch (refreshError) {
      // Refresh failed, logout user
      useAuthStore.getState().logout()
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
```

### Auth Provider

**providers/auth-provider.tsx**:
```typescript
'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
```

### Protected Route Component

**components/protected-route.tsx**:
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }

    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user &&
      !requiredRole.includes(user.role)
    ) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
```

**Usage**:
```typescript
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

// Admin only
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

### Next.js Middleware (Recommended)

**middleware.ts**:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const publicPaths = ['/login', '/register', '/forgot-password']
const protectedPaths = ['/dashboard', '/profile', '/settings']
const adminPaths = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('accessToken')?.value

  // Check if accessing protected path
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
  const isAdmin = adminPaths.some((path) => pathname.startsWith(path))

  if (!token && (isProtected || isAdmin)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    try {
      // Verify JWT
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Check role for admin paths
      if (isAdmin && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      // Token invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Login Component

**components/login-form.tsx**:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function LoginForm() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Login failed')
      }

      const { user, accessToken, refreshToken } = await response.json()

      setTokens(accessToken, refreshToken)
      setUser(user)

      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

## Role-Based Access Control (RBAC)

### Hook for Role Check

**hooks/use-role.ts**:
```typescript
import { useAuthStore } from '@/stores/auth-store'

export function useRole() {
  const { user } = useAuthStore()

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(user.role)
  }

  const isAdmin = () => hasRole('admin')
  const isUser = () => hasRole('user')

  return { hasRole, isAdmin, isUser, role: user?.role }
}
```

**Usage**:
```typescript
export function AdminButton() {
  const { isAdmin } = useRole()

  if (!isAdmin()) {
    return null
  }

  return <button>Admin Action</button>
}
```

### Permission-Based Component

**components/can.tsx**:
```typescript
import { type ReactNode } from 'react'
import { useRole } from '@/hooks/use-role'

interface CanProps {
  perform: string | string[]
  yes: () => ReactNode
  no?: () => ReactNode
}

export function Can({ perform, yes, no }: CanProps) {
  const { hasRole } = useRole()

  return hasRole(perform) ? yes() : no ? no() : null
}
```

**Usage**:
```typescript
<Can
  perform="admin"
  yes={() => <button>Delete User</button>}
  no={() => <p>You don't have permission</p>}
/>
```

## OAuth Integration

### Google OAuth (NextAuth.js)

**app/api/auth/[...nextauth]/route.ts**:
```typescript
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { type JWT } from 'next-auth/jwt'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.id as string
      session.accessToken = token.accessToken as string
      return session
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Usage**:
```typescript
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }

  return <button onClick={() => signIn('google')}>Sign in with Google</button>
}
```

## Session-Based Auth (Cookies)

### Set Cookie on Login

```typescript
// API Route
export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Verify credentials
  const user = await verifyCredentials(email, password)

  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Create session token
  const token = await createSessionToken(user)

  // Set httpOnly cookie
  const response = Response.json({ user })
  response.headers.set(
    'Set-Cookie',
    `session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`
  )

  return response
}
```

### Read Cookie in Middleware

```typescript
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  if (!session && isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

## JWT Utilities

### Token Verification

```typescript
import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createToken(payload: any, expiresIn = '15m') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
```

## Best Practices

1. **Use httpOnly cookies** for tokens when possible
2. **Implement token refresh** to keep users logged in
3. **Never store tokens in localStorage** if avoidable (XSS risk)
4. **Use HTTPS** in production
5. **Set short expiry** for access tokens (15 min)
6. **Implement CSRF protection** for session-based auth
7. **Validate tokens** on every request
8. **Clear tokens** on logout
9. **Handle expired tokens** gracefully
10. **Use middleware** for route protection (Next.js)

## Security Checklist

- [ ] Tokens stored securely (httpOnly cookies preferred)
- [ ] HTTPS enabled in production
- [ ] Token refresh implemented
- [ ] Access tokens short-lived (15 min)
- [ ] Refresh tokens rotated on use
- [ ] CSRF protection enabled
- [ ] XSS protection (CSP headers)
- [ ] Rate limiting on auth endpoints
- [ ] Password hashing (bcrypt, argon2)
- [ ] 2FA support (optional but recommended)

## Common Patterns

### Automatic Token Refresh

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const { accessToken, refreshToken } = useAuthStore.getState()
    
    if (accessToken && isTokenExpired(accessToken) && refreshToken) {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
        const { accessToken: newToken } = await response.json()
        useAuthStore.getState().setTokens(newToken, refreshToken)
      } catch (error) {
        useAuthStore.getState().logout()
      }
    }
  }, 60000) // Check every minute

  return () => clearInterval(interval)
}, [])
```

### Logout Everywhere

```typescript
// API endpoint to invalidate all sessions
export async function POST(request: Request) {
  const { userId } = await request.json()
  
  // Invalidate all refresh tokens for user
  await db.refreshToken.deleteMany({
    where: { userId },
  })
  
  return Response.json({ success: true })
}
```

## Tips for Success

- Start with simpler auth (JWT) before OAuth
- Use existing libraries when possible
- Test auth flows thoroughly
- Handle edge cases (expired, invalid tokens)
- Log auth events for security
- Implement proper error messages
- Add loading states
- Test on multiple devices
- Consider social login for better UX
- Plan for password reset flows

Remember: Security is not optional. Always follow best practices and keep dependencies updated.
