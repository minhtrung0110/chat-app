import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserStatus } from '../../common/enums/user-status.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstname?: string;

  @Field({ nullable: true })
  lastname?: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
  @Field()
  googleId?: string;
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Tùy chọn mở rộng: Nếu muốn trả về roles, conversations, v.v.
  // @Field(() => [RoleModel], { nullable: true })
  // roles?: RoleModel[];
}
