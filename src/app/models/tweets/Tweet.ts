import { User } from '../user/User';

export interface Tweet {
  id: number;
  tweet: string;
  postedBy: User;
}