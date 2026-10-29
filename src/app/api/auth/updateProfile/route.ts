import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { firstProfileError, PROFILE_MESSAGES, updateProfileBodySchema } from '@/lib/profileValidation';
import { AUTH_MESSAGES, parseParentEmailUpdate } from '@/lib/authValidation';
import { CONSENT_VERSION } from '@/lib/consent';

// Only non-sensitive fields are sent back (no password hash, no card fields, and never
// the parent email - not even when it was just added)
const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  age: true,
  grade: true,
  profileImage: true,
  profileUpdated: true,
} as const;

export async function PUT(req: Request) {
  // Always update the signed-in user; never trust a userId sent by the client
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: PROFILE_MESSAGES.invalidRequest }), { status: 400 });
  }

  // Profile fields only. Card fields are no longer collected: if an old client still
  // sends them, the schema strips them and they are never written.
  const parsed = updateProfileBodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: firstProfileError(parsed.error) }), { status: 400 });
  }
  const { firstName, lastName, age, grade, profileImage } = parsed.data.data;

  // Optional: add a parent email to an account that has none (all three fields
  // together: parentEmail, confirmParentEmail, acceptedTerms). Validated here; the
  // add-only rule is enforced by the database condition below.
  const emailUpdate = parseParentEmailUpdate((body as { data?: unknown }).data);
  if (emailUpdate.action === 'reject') {
    return new Response(JSON.stringify({ error: emailUpdate.error }), { status: 400 });
  }

  const profileData = {
    firstName,
    lastName,
    age,
    grade,
    // Omitted = keep the stored image; empty = no image
    ...(profileImage !== undefined && { profileImage: profileImage || null }),
    // The profile step alone completes onboarding (there is no card step anymore)
    profileUpdated: true,
  };

  try {
    if (emailUpdate.action === 'set') {
      // Add-only, checked against the database in the same statement: the row is only
      // updated if it has NO parent email yet. If one is already on file, nothing at
      // all is written (profile fields included) and the request is rejected.
      const result = await prisma.user.updateMany({
        where: { id: userId, parentEmail: null },
        data: {
          ...profileData,
          parentEmail: emailUpdate.parentEmail, // already trimmed + lower-cased
          parentConsentAt: new Date(),
          consentVersion: CONSENT_VERSION,
        },
      });
      if (result.count !== 1) {
        return new Response(JSON.stringify({ error: AUTH_MESSAGES.parentEmailAlreadySet }), { status: 400 });
      }
      const updatedUser = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
      return new Response(JSON.stringify(updatedUser), { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: profileData,
      select: PUBLIC_USER_SELECT,
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), { status: 500 });
  }
}
