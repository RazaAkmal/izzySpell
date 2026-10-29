import { z } from "zod";

// Shared sign-up / reset-password rules, used by both the forms (browser) and the
// API routes (server) so the two can't drift apart.

export const AUTH_MESSAGES = {
  usernameRequired: "Username is required",
  usernameTooShort: "Username must be at least 4 characters",
  usernameTooLong: "Username must be at most 30 characters",
  usernameCharacters: "Username must contain only letters and numbers",
  usernameAllNumbers: "Username cannot be all numbers",
  passwordRequired: "Password is required",
  passwordTooShort: "Password must be at least 8 characters",
  passwordTooLong: "Password is too long (maximum 72 bytes)",
  passwordsDoNotMatch: "Passwords do not match",
  userExists: "User with this name already exists",
  invalidRequest: "Invalid request. Please try again.",
  parentEmailRequired: "Email is required",
  parentEmailInvalid: "Please enter a valid email address",
  parentEmailsDoNotMatch: "Emails do not match",
  termsRequired: "Please accept the Terms of Service and Privacy Policy",
  resetLinkInvalid: "This link is invalid or has expired. Please request a new one.",
  parentEmailIncomplete: "To add an email, enter it twice and tick the box.",
  parentEmailAlreadySet: "This account already has an email. To change it, contact support.",
} as const;

export const EMAIL_MAX_LENGTH = 254;

export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password; anything longer would be
// silently ignored, so it is rejected instead.
export const PASSWORD_MAX_BYTES = 72;

// Same character rule the sign-up form has always used: letters and numbers only
export const USERNAME_PATTERN = /^[\p{L}\p{N}]+$/u;
const HAS_LETTER = /\p{L}/u;

// UTF-8 byte length. TextEncoder works in both the browser and Node and gives the
// same result as Buffer.byteLength(value, "utf8").
export const utf8ByteLength = (value: string) => new TextEncoder().encode(value).length;

export const usernameSchema = z
  .string({ required_error: AUTH_MESSAGES.usernameRequired, invalid_type_error: AUTH_MESSAGES.usernameRequired })
  .trim()
  .min(1, AUTH_MESSAGES.usernameRequired)
  .min(USERNAME_MIN_LENGTH, AUTH_MESSAGES.usernameTooShort)
  .max(USERNAME_MAX_LENGTH, AUTH_MESSAGES.usernameTooLong)
  .regex(USERNAME_PATTERN, AUTH_MESSAGES.usernameCharacters)
  .refine((value) => HAS_LETTER.test(value), AUTH_MESSAGES.usernameAllNumbers);

export const passwordSchema = z
  .string({ required_error: AUTH_MESSAGES.passwordRequired, invalid_type_error: AUTH_MESSAGES.passwordRequired })
  .min(1, AUTH_MESSAGES.passwordRequired)
  .min(PASSWORD_MIN_LENGTH, AUTH_MESSAGES.passwordTooShort)
  .refine((value) => utf8ByteLength(value) <= PASSWORD_MAX_BYTES, AUTH_MESSAGES.passwordTooLong);

// For looking up an EXISTING account (reset password): only trimmed and non-empty.
// The sign-up format rules are not applied, so accounts created before these rules
// can still reset their password.
export const existingUsernameSchema = z
  .string({ required_error: AUTH_MESSAGES.usernameRequired, invalid_type_error: AUTH_MESSAGES.usernameRequired })
  .trim()
  .min(1, AUTH_MESSAGES.usernameRequired);

// Account email (stored in users.parent_email): trimmed and lower-cased; stored that
// way. Not unique (one person can have several accounts).
export const emailSchema = z
  .string({ required_error: AUTH_MESSAGES.parentEmailRequired, invalid_type_error: AUTH_MESSAGES.parentEmailRequired })
  .trim()
  .toLowerCase()
  .min(1, AUTH_MESSAGES.parentEmailRequired)
  .max(EMAIL_MAX_LENGTH, AUTH_MESSAGES.parentEmailInvalid)
  .email(AUTH_MESSAGES.parentEmailInvalid);

// Same normalisation as emailSchema, for comparing the "confirm" field
export const normalizeEmail = (value: unknown) => (typeof value === "string" ? value.trim().toLowerCase() : "");

// The consent checkbox must be literally `true`
export const acceptedTermsSchema = z.literal(true, {
  errorMap: () => ({ message: AUTH_MESSAGES.termsRequired }),
});

// Raw reset token from the emailed link: 32 random bytes as base64url = 43 characters.
// Any problem with it gets the single "invalid or expired" message.
export const RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const resetTokenSchema = z
  .string({ required_error: AUTH_MESSAGES.resetLinkInvalid, invalid_type_error: AUTH_MESSAGES.resetLinkInvalid })
  .regex(RESET_TOKEN_PATTERN, AUTH_MESSAGES.resetLinkInvalid);

const confirmPasswordField = z.string({
  required_error: AUTH_MESSAGES.passwordsDoNotMatch,
  invalid_type_error: AUTH_MESSAGES.passwordsDoNotMatch,
});

export const signupSchema = z
  .object({
    name: usernameSchema,
    parentEmail: emailSchema,
    confirmParentEmail: z.string({
      required_error: AUTH_MESSAGES.parentEmailsDoNotMatch,
      invalid_type_error: AUTH_MESSAGES.parentEmailsDoNotMatch,
    }),
    password: passwordSchema,
    confirmPassword: confirmPasswordField,
    acceptedTerms: acceptedTermsSchema,
  })
  .superRefine((data, ctx) => {
    if (normalizeEmail(data.confirmParentEmail) !== data.parentEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: AUTH_MESSAGES.parentEmailsDoNotMatch, path: ["confirmParentEmail"] });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: AUTH_MESSAGES.passwordsDoNotMatch, path: ["confirmPassword"] });
    }
  });

// POST /api/auth/forgotPassword: only the username
export const forgotPasswordSchema = z.object({
  name: existingUsernameSchema,
});

// POST /api/auth/resetPassword: token from the emailed link + the new password, and
// NOTHING ELSE (.strict): the old { name, password } body is rejected, so a password
// can no longer be changed by knowing a username.
export const resetPasswordSchema = z
  .object({
    token: resetTokenSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordField,
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });

// First error message from a failed parse, for API responses. Problems with the
// request body itself (not a specific field) get the generic message.
export const firstErrorMessage = (error: z.ZodError) => {
  const issue = error.issues[0];
  return issue && issue.path.length > 0 ? issue.message : AUTH_MESSAGES.invalidRequest;
};

// react-hook-form `validate` rule backed by a zod schema: true when valid,
// otherwise the first error message (shown under the field as before).
export const zodFieldRule = (schema: z.ZodTypeAny) => (value: unknown) => {
  const result = schema.safeParse(value);
  return result.success || (result.error.issues[0]?.message ?? AUTH_MESSAGES.invalidRequest);
};

// ---------------------------------------------------------------------------
// Adding an email to an EXISTING account from "My Profile" (accounts created
// before sign-up asked for one). Add-only on purpose: once an account has an
// email it cannot be changed there, so a stolen session can't swap the email and then
// take the account over through password reset. The "only while none is on file" part
// is enforced on the server against the database (updateProfile route).

const PARENT_EMAIL_FIELDS = ["parentEmail", "confirmParentEmail", "acceptedTerms"] as const;

export const parentEmailAdditionSchema = z
  .object({
    parentEmail: emailSchema,
    confirmParentEmail: z.string({
      required_error: AUTH_MESSAGES.parentEmailsDoNotMatch,
      invalid_type_error: AUTH_MESSAGES.parentEmailsDoNotMatch,
    }),
    acceptedTerms: acceptedTermsSchema,
  })
  .refine((d) => normalizeEmail(d.confirmParentEmail) === d.parentEmail, {
    message: AUTH_MESSAGES.parentEmailsDoNotMatch,
    path: ["confirmParentEmail"],
  });

export type ParentEmailUpdate =
  | { action: "none" }
  | { action: "set"; parentEmail: string }
  | { action: "reject"; error: string };

// The three optional fields must come together: none -> nothing to do;
// some but not all -> reject; all three -> validate.
export function parseParentEmailUpdate(data: unknown): ParentEmailUpdate {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const present = PARENT_EMAIL_FIELDS.filter((key) => record[key] !== undefined);
  if (present.length === 0) return { action: "none" };
  if (present.length !== PARENT_EMAIL_FIELDS.length) {
    return { action: "reject", error: AUTH_MESSAGES.parentEmailIncomplete };
  }
  const parsed = parentEmailAdditionSchema.safeParse(record);
  if (!parsed.success) {
    return { action: "reject", error: parsed.error.issues[0]?.message ?? AUTH_MESSAGES.invalidRequest };
  }
  return { action: "set", parentEmail: parsed.data.parentEmail };
}

// The add-only rule: an email may only be added while none is on file
export const canAddParentEmail = (existingParentEmail: string | null | undefined) => !existingParentEmail;
