import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(id: string, content: string) {
    return this.prisma.message.create({
      data: {
        id,
        content,
      },
      include: {
        user: true,
      },
    });
  }

  async getMessages() {
    return this.prisma.message.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
