import { useAuth } from './AuthContext.tsx'

/** Returns true if the current user has the given role. */
export function useHasRole(role: string): boolean {
    const { user } = useAuth()
    return user?.roles.includes(role) ?? false
}

/** Returns true if the current user is of the given type. */
export function useIsUserType(type: string): boolean {
    const { user } = useAuth()
    return user?.userType === type
}