'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BilledParty, BankDetails } from '@/types/invoice'

interface UserProfile {
  billedBy: Partial<BilledParty>
  bankDetails: Partial<BankDetails>
  logo?: string
}

interface UserProfileStore {
  profile: UserProfile
  hasProfile: boolean
  saveProfile: (data: Partial<UserProfile>) => void
  clearProfile: () => void
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: { billedBy: {}, bankDetails: {} },
      hasProfile: false,
      saveProfile: (data) =>
        set((s) => ({
          profile: { ...s.profile, ...data },
          hasProfile: true,
        })),
      clearProfile: () =>
        set({ profile: { billedBy: {}, bankDetails: {} }, hasProfile: false }),
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
