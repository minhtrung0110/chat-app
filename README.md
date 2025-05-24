## 


## DOCKER

### Instruction
We have 3 file docker compose 
- docker-compose.db.yml:	Chỉ chạy PostgreSQL riêng
- docker-compose.migrate.yml: Chạy migration Prisma trong container riêng
- docker-compose.yml:	Chạy toàn bộ ứng dụng NestJS + PostgreSQL

### SWAGGER 
Access: http://localhost:3000/api/docs



Phát triển từng bước
Giai đoạn 1: Hoàn thiện backend chat basic
Đăng ký, đăng nhập

Quản lý user, bạn bè (friend table, request table)

Chat 1-1 realtime

Lưu tin nhắn vào DB

Xem lịch sử chat

Socket.IO quản lý nhiều kết nối

Giai đoạn 2: Thêm nhóm chat (Group)
Tạo bảng nhóm, bảng thành viên nhóm

Gửi/nhận chat nhóm

Mời user vào nhóm

Giai đoạn 3: Nâng cấp & tối ưu
File/ảnh

Trạng thái đã xem, đang nhập, online/offline

Tìm kiếm

Thông báo (notification)