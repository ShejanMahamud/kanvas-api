export interface IUser {
  name: string;
  email: string;
  password: string;
}
export interface ErrorWithStatus extends Error {
  status?: number;
}
