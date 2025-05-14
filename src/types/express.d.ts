import { ISubscription } from '../models/subscription.model';
import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      subscription?: ISubscription;
      hasActiveSubscription?: boolean;
    }
  }
}
