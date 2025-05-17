import { SearchUsers } from './SeachUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {

  const query = (await params.searchParams).search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  console.log('users', users)

  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `doctor` role.</p>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            {/* @ts-expect-error: Action forms do not have a defined type in this context */}
            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="doctor" name="role" />
              <button type="submit">Make doctor</button>
            </form>

            {/* @ts-expect-error: Action forms do not have a defined type in this context */}
            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
}