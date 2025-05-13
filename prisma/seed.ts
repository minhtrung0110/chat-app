import { PrismaClient } from '@prisma/client';
import { UserStatus } from '../src/common/enums/user-status.enum';

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ
  await prisma.messageEmotion.deleteMany();
  await prisma.messageMention.deleteMany();
  await prisma.messageStatus.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.authProvider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('Seeding...');

  // 1. Tạo Role
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Regular user role',
    },
  });

  // 2. Tạo User
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      firstname: 'Nguyen Van',
      lastname: 'Admin',
      password: '$2a$12$EESu/pbwe.k2km4pyUOxEuGuCozdzy9HuV9L7YX/AWNv2O3OLMvHy', // 123456
      status: UserStatus.ACTIVE,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      username: 'behotlu6969',
      email: 'bethotlu@example.com',
      firstname: 'Be Hot',
      lastname: 'Lu',
      password: '$2a$12$EESu/pbwe.k2km4pyUOxEuGuCozdzy9HuV9L7YX/AWNv2O3OLMvHy', // 123456
      status: UserStatus.ACTIVE,
      roles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  // 3. Tạo Group Conversation
  const conversation = await prisma.conversation.create({
    data: {
      name: 'General Group Chat',
      isGroup: true,
      createdById: adminUser.id,
      participants: {
        create: [
          {
            userId: adminUser.id,
            role: 'admin',
          },
          {
            userId: normalUser.id,
            role: 'member',
          },
        ],
      },
    },
  });

  // 4. Tạo Message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: adminUser.id,
      content: 'Welcome to the group chat!',
      messageType: 'text',
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
