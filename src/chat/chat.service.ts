import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Tìm hoặc tạo conversation 1-1 giữa 2 user
  async findOrCreatePrivateConversation(userAId: string, userBId: string) {
    // Tìm conversation PRIVATE có đúng 2 member là userA, userB
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: [userAId, userBId] },
          },
        },
      },
      include: { participants: true },
    });

    // Nếu chưa có thì tạo mới
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { user: { connect: { id: userAId } } },
              { user: { connect: { id: userBId } } },
            ],
          },
        },
        include: { participants: true },
      });
    }
    return conversation;
  }

  // Lưu message vào DB
  async saveMessage(conversationId: string, senderId: string, content: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });
  }

  // Lấy lịch sử chat trong 1 conversation
  async getMessages(conversationId: string, limit = 30) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { sender: true },
    });
  }
}
