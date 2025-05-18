import { User as PrismaUser } from '@prisma/client';
import { User } from '../../users/models/user.model';
import { UserStatus } from '../enums/user-status.enum';

export function toGraphQLUser(prismaUser: PrismaUser): User {
  return {
    ...prismaUser,
    status: UserStatus[prismaUser.status as keyof typeof UserStatus],
  };
}
