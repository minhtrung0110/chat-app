import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Có thể custom theo ý bạn
  },
  namespace: '/chat', // Có thể bỏ nếu không cần namespace riêng
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  private usersInRoom: Map<string, Set<string>> = new Map();

  constructor(private readonly chatService: ChatService) {}

  // Lắng nghe sự kiện client gửi message
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { room: string; message: string; sender: string; receiver: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Tìm hoặc tạo conversation giữa sender và receiver
    const conversation = await this.chatService.findOrCreatePrivateConversation(
      data.sender,
      data.receiver,
    );

    // Lưu message vào DB
    await this.chatService.saveMessage(conversation.id, data.sender, data.message);

    // Gửi lại cho tất cả client trong phòng (room)
    this.server.to(data.room).emit('receive_message', {
      room: data.room,
      message: data.message,
      sender: data.sender,
      createdAt: new Date().toISOString(),
    });

    return { status: 'ok' };
  }

  // Client join room
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.emit('joined_room', { room: data.room });

    // Thêm user vào room
    if (!this.usersInRoom.has(data.room)) {
      this.usersInRoom.set(data.room, new Set());
    }
    this.usersInRoom.get(data.room)?.add(data.user);

    // Emit danh sách user trong phòng cho tất cả user
    this.server.to(data.room).emit('users_in_room', {
      room: data.room,
      users: Array.from(this.usersInRoom.get(data.room) || []),
    });

    console.log('Users in room:', data.room, Array.from(this.usersInRoom.get(data.room) || []));
  }
  // Client rời phòng
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    client.emit('left_room', { room: data.room });

    // Xóa user khỏi room
    this.usersInRoom.get(data.room)?.delete(data.user);

    // Emit lại danh sách user còn lại
    this.server.to(data.room).emit('users_in_room', {
      room: data.room,
      users: Array.from(this.usersInRoom.get(data.room) || []),
    });
  }

  // Xử lý khi socket disconnect
  handleDisconnect(client: Socket) {
    // Nếu muốn nâng cao, bạn cần map user <-> socketId để xóa chính xác hơn
    // Có thể truyền user lên từ client khi disconnect hoặc lưu map socketId <-> user khi join_room
    // Đây là gợi ý:
    // 1. Khi join_room, lưu this.socketIdToUser.set(client.id, data.user)
    // 2. Khi disconnect, duyệt usersInRoom xóa user có socketId đó
  }
}
