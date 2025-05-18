import { User } from '../users/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
