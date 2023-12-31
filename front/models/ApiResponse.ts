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

export type ClientResponse = {
  id: number;
  nombre: string;
  tipo?: string;
  ruc?: string;
  nro_tel?: string;
  comentario?: string;
};

export type ClientFilesResponse = {
  path: string;
  uploadDate: string;
}[];

export type FileDownloadResponse = {
  file: string;
  type: string;
};
