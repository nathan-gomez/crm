type DefaultResponse = { message: string } | { error: string; }

type UserDataResponse = {
  role: string;
  username: string
}

export type { DefaultResponse, UserDataResponse }
