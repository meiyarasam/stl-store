export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  country: string;
  phoneCountryCode: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: Date;
}

declare global {
  // eslint-disable-next-line no-var
  var localDevUsers: Map<string, StoredUser> | undefined;
}

export const localDevUsers: Map<string, StoredUser> =
  global.localDevUsers || new Map<string, StoredUser>();

if (process.env.NODE_ENV !== "production") {
  global.localDevUsers = localDevUsers;
}

export function saveLocalDevUser(user: StoredUser) {
  localDevUsers.set(user.email.toLowerCase().trim(), user);
}

export function getLocalDevUser(email: string): StoredUser | undefined {
  return localDevUsers.get(email.toLowerCase().trim());
}
