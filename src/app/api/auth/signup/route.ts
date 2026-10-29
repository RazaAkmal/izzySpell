
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AUTH_MESSAGES, firstErrorMessage, signupSchema } from '@/lib/authValidation';
import { usernameTakenIgnoringCase } from '@/lib/findUserByName';
import { CONSENT_VERSION } from '@/lib/consent';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: AUTH_MESSAGES.invalidRequest }), { status: 400 });
  }

  // Same rules as the sign-up form (src/lib/authValidation.ts); `name` comes back trimmed
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: firstErrorMessage(parsed.error) }), { status: 400 });
  }
  // parentEmail comes back trimmed + lower-cased; acceptedTerms is literally true
  const { name, password, parentEmail } = parsed.data;

  try {
    // "Raza" and "raza" are the same username
    if (await usernameTakenIgnoringCase(name)) {
      return new Response(JSON.stringify({ error: AUTH_MESSAGES.userExists }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        // Parental consent captured at sign-up (checkbox is required by the schema)
        parentEmail,
        parentConsentAt: new Date(),
        consentVersion: CONSENT_VERSION,
      },
      // Never send the password hash back to the browser
      select: { id: true, name: true },
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (error) {
    // Unique index still guards against two sign-ups racing for the exact same name
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return new Response(JSON.stringify({ error: AUTH_MESSAGES.userExists }), { status: 400 });
    }

    console.error('Error during signup:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong on our side while creating your account. Please try again in a moment.' }),
      { status: 500 }
    );
  }
}
