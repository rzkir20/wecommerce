type UserRole =
    | 'super_admins'
    | 'admins'
    | 'affiliate'
    | 'users'
    | 'seller'

type AuthUser = {
    id: string
    email: string
    name: string
    phone: string | null
    role?: UserRole
    gender?: string | null
    date?: string | null
}

type AuthProviderProps = {
    children: React.ReactNode
    initialUser?: AuthUser | null
}

type AuthState = {
    user: AuthUser | null
    ready: boolean
}

type AuthContextValue = AuthState & {
    login: (email: string, password: string) => Promise<void>
    refreshSession: () => Promise<AuthUser | null>
    register: (
        name: string,
        email: string,
        password: string,
        phone?: string,
    ) => Promise<void>
    updateProfile: (body: UpdateProfileBody) => Promise<{ user: AuthUser }>
    logout: () => void
}

// ==================== Login With Qr ==================== //
type QrInitResponse = { qrToken: string; expiresAt: number }

type QrLoginStatusResponse = {
    status: 'pending' | 'approved' | 'expired' | 'used'
    expiresAt?: number
    user?: { id: string; email: string; name: string }
}

// ==================== Update Profile ==================== //
type UpdateProfileBody = {
    name: string
    phone: string | null
    gender: 'male' | 'female' | null
    date: string | null
}

type ProfileDraft = {
    fullName: string
    displayName: string
    phone: string
    gender: 'male' | 'female' | null
    dobDay: string
    dobMonth: string
    dobYear: string
}
