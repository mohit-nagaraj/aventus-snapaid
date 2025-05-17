import { createClientSideSupabase } from './client'
import { useSession } from '@clerk/nextjs'

export const useSupabase = async () => {
  const { session } = useSession()
  const token = session ? await session.getToken() : undefined
  
  return createClientSideSupabase(token || undefined)
}