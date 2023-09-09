export type DefaultResponse = { message: string } | { error: string };

export type UserDataResponse = {
  role: string;
  username: string;
};

export type RolesResponse = {
  id: string;
  role: string;
};
