export interface Database {
  users: User;
}
export interface User {
  id: string;
  outside_id: string;
  role: string;
  status: string;
}
