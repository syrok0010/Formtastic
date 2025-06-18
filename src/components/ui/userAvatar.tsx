import { auth } from "@/auth"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session?.user) return null

  console.log("User session:", session.user)
 
  return (
    <div>
      <img src={session.user.image ?? undefined} alt="User Avatar" />
    </div>
  )
}