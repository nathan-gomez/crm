type DefaultResponse = { message: string } | { error: string; }

type LoginResponse = {
  id: string;
  role: string;
  username: string
}

export type { DefaultResponse, LoginResponse }