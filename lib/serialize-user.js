// Helper to serialize Clerk user to plain object for client components
export function serializeUser(user) {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.emailAddresses?.[0]?.emailAddress || null,
    emailAddresses: user.emailAddresses?.map(email => ({
      emailAddress: email.emailAddress,
      id: email.id,
    })) || [],
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    profileImageUrl: user.imageUrl, // Clerk's profile image
    username: user.username,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  }
}

