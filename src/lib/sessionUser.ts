// The ONLY user fields kept in the login token and exposed as `session.user`.
// A search of src shows the app reads just `session.user.id` (everywhere) and
// `session.user.name` (header in DashboardLayout); profile fields always come from
// getUserDetails. Never add the password hash or card fields here.
export const toSessionUser = (source: { id?: unknown; name?: unknown }) => ({
  id: typeof source.id === "string" ? source.id : undefined,
  name: typeof source.name === "string" ? source.name : undefined,
});
