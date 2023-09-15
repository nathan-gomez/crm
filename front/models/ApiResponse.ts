export type DefaultResponse = { message: string } | { error: string };

export type UserDataResponse = {
  role: string;
  username: string;
};

export type RolesResponse = {
  id: string;
  role: string;
};

export type UsersResponse = {
  id: string;
  role: string;
  username: string;
  created_at: string;
};
