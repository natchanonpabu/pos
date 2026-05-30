'use server'

import { userService } from '@/services/user.service'
import type { UserRole } from '@/types/user'

const VALID_ROLES: UserRole[] = ['admin', 'staff', 'manager']

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole)
}

export async function createUser(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')
  const fullName = formData.get('fullName')
  const role = formData.get('role')
  const password = formData.get('password')

  if (
    typeof email !== 'string' ||
    typeof fullName !== 'string' ||
    typeof role !== 'string' ||
    typeof password !== 'string'
  ) {
    return { success: false, error: 'All fields are required' }
  }

  if (!email.trim() || !fullName.trim() || !password.trim()) {
    return { success: false, error: 'Fields cannot be empty' }
  }

  if (!isValidRole(role)) {
    return { success: false, error: 'Invalid role' }
  }

  const { error } = await userService.create({
    email,
    fullName,
    role,
    password,
  })

  if (error) {
    return { success: false, error }
  }

  return { success: true }
}

export async function updateUser(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const fullName = formData.get('fullName')
  const role = formData.get('role')

  const updateData: Partial<{ fullName: string; role: UserRole; isActive: boolean }> = {}

  if (typeof fullName === 'string' && fullName.trim()) {
    updateData.fullName = fullName
  }

  if (typeof role === 'string' && isValidRole(role)) {
    updateData.role = role
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: 'No valid fields to update' }
  }

  const { error } = await userService.update(id, updateData)

  if (error) {
    return { success: false, error }
  }

  return { success: true }
}

export async function deleteUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await userService.delete(id)

  if (error) {
    return { success: false, error }
  }

  return { success: true }
}

export async function toggleUserActive(
  id: string,
  isActive: boolean
): Promise<void> {
  await userService.update(id, { isActive })
}
