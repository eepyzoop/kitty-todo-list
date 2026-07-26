export type Task = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  done_at: string | null;
  created_at: string;
};
