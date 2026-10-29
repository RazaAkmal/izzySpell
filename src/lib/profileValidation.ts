import { z } from "zod";

// Shared profile rules, used by the profile form (browser) and the
// /api/auth/updateProfile route (server). The age and grade options are the ones
// the profile form has always offered.

export const AGE_OPTIONS = ["6-7", "7-8", "8-9", "9-10", "10-11", "11-12"] as const;
export const GRADE_OPTIONS = [
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
] as const;

export const NAME_MAX_LENGTH = 50;
// Uploaded images are stored as a URL; generous limit for any storage URL
export const PROFILE_IMAGE_MAX_LENGTH = 2048;

export const PROFILE_MESSAGES = {
  invalidRequest: "Invalid request. Please try again.",
  firstNameRequired: "First name is required",
  firstNameTooLong: `First name must be at most ${NAME_MAX_LENGTH} characters`,
  lastNameRequired: "Last name is required",
  lastNameTooLong: `Last name must be at most ${NAME_MAX_LENGTH} characters`,
  ageInvalid: "Please select your Age",
  gradeInvalid: "Please select your Grade",
  profileImageInvalid: "Profile image is invalid",
} as const;

const nameField = (required: string, tooLong: string) =>
  z
    .string({ required_error: required, invalid_type_error: required })
    .trim()
    .min(1, required)
    .max(NAME_MAX_LENGTH, tooLong);

export const firstNameSchema = nameField(PROFILE_MESSAGES.firstNameRequired, PROFILE_MESSAGES.firstNameTooLong);
export const lastNameSchema = nameField(PROFILE_MESSAGES.lastNameRequired, PROFILE_MESSAGES.lastNameTooLong);

export const ageSchema = z.enum(AGE_OPTIONS, {
  errorMap: () => ({ message: PROFILE_MESSAGES.ageInvalid }),
});
export const gradeSchema = z.enum(GRADE_OPTIONS, {
  errorMap: () => ({ message: PROFILE_MESSAGES.gradeInvalid }),
});

// Unknown keys (e.g. card fields sent by an old client) are stripped by zod,
// so they can never reach the database.
export const profileSchema = z.object(
  {
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    age: ageSchema,
    grade: gradeSchema,
    // Optional: omitted = leave the stored image unchanged; "" = no image
    profileImage: z
      .string({ invalid_type_error: PROFILE_MESSAGES.profileImageInvalid })
      .trim()
      .max(PROFILE_IMAGE_MAX_LENGTH, PROFILE_MESSAGES.profileImageInvalid)
      .nullable()
      .optional(),
  },
  { required_error: PROFILE_MESSAGES.invalidRequest, invalid_type_error: PROFILE_MESSAGES.invalidRequest }
);

// Request body of PUT /api/auth/updateProfile: { data: {...profile} }.
// Any other top-level keys (the form also sends userId) are ignored.
export const updateProfileBodySchema = z.object(
  { data: profileSchema },
  { required_error: PROFILE_MESSAGES.invalidRequest, invalid_type_error: PROFILE_MESSAGES.invalidRequest }
);

export const firstProfileError = (error: z.ZodError) =>
  error.issues[0]?.message ?? PROFILE_MESSAGES.invalidRequest;
