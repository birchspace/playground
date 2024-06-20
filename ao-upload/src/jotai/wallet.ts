import { atom } from 'jotai'
import type { GQLNodeResponseType } from '~/types'

interface ProfileProps {
    id: null | string,
    walletAddress: null | string,
    displayName: null | string,
    username: null | string,
    bio: null | string,
    avatar: null | string,
    banner: null | string,
}

export const walletConnectedAtom = atom<boolean>(false)
export const walletAddressAtom = atom<string | null>(null)
export const walletProfileAtom = atom<ProfileProps | null>(null)
export const walletAssetsAtom = atom<GQLNodeResponseType[] | null>(null)