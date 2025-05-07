
## Main.ts

##### Giải thích từng phần

- ✅ app.useGlobalPipes(new ValidationPipe());
````
Dùng ValidationPipe toàn cục

Tự động:

Validate DTOs (data transfer objects)

Chuyển đổi type (transform)

Throw lỗi nếu dữ liệu không đúng

Ví dụ: validate @Body() dựa trên DTO có @IsEmail(), @IsString()

````

- ✅ app.enableShutdownHooks();
````angular2html
Cho phép sử dụng lifecycle hook onModuleDestroy() và onApplicationShutdown()

Dùng để cleanup khi app tắt (ngắt kết nối DB, clear worker...)
````


- ✅ Prisma Exception Filter
````
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
````
Tự động bắt và chuyển lỗi của Prisma thành lỗi HTTP đẹp hơn

Ví dụ: Prisma.PrismaClientKnownRequestError → HTTP 409, 400...


- ✅ ConfigService
```` 
const configService = app.get(ConfigService);
const nestConfig = configService.get<NestConfig>('nest');
const corsConfig = configService.get<CorsConfig>('cors');
const swaggerConfig = configService.get<SwaggerConfig>('swagger');
````

Truy xuất cấu hình từ .env qua @nestjs/config

nestConfig.port, swaggerConfig.enabled, v.v.

config.interface.ts định nghĩa các type tương ứng (NestConfig, CorsConfig...)

## App.module.ts

##### 1. Module là gì trong NestJS?
   Mỗi tính năng (auth, user, post...) nên là 1 module để tách biệt, dễ quản lý

AppModule là module gốc chứa toàn bộ ứng dụng
##### 2. NestJS cần gì trong 1 Module?

| Thành phần    | Ý nghĩa đơn giản                                      | Khi nào dùng?                                 |
|---------------|--------------------------------------------------------|------------------------------------------------|
| `imports`     | Gộp các module khác để dùng chung                     | Dùng khi cần service/module từ nơi khác        |
| `controllers` | Nhận request từ client (HTTP, GraphQL, v.v.)          | Khi xử lý HTTP request                         |
| `providers`   | Logic xử lý phía sau: service, resolver, guard        | Khi cần xử lý logic/phục vụ controller         |

##### 3. Tổng luồng logic ứng dụng:
```
Client → Controller (hoặc Resolver) → Provider (Service) → Truy vấn DB (Prisma)
```

