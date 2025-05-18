// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-google-oauth20';
// import { ConfigService } from '@nestjs/config';
//
// import { AuthService } from '../auth.service';
// import { PrismaService } from 'nestjs-prisma';
//
// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(
//     private configService: ConfigService,
//     private prismaService: PrismaService,
//     private authService: AuthService,
//   ) {
//     super({
//       clientID: configService.get('GOOGLE_CLIENT_ID'),
//       clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
//       callbackURL: `${configService.get('LOCAL_HOST')}/auth/google/redirect`,
//       scope: ['email', 'profile'],
//     });
//   }
//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     //done: VerifyCallback,
//   ): Promise<any> {
//     const { name, emails, photos } = profile;
//     const data = {
//       email: emails[0].value,
//       firstName: name.givenName,
//       lastName: name.familyName,
//       picture: photos[0].value,
//       accessToken,
//     };
//     //insert data to database
//     // done(null, data);
//     return this.authService.validateUser(data);
//   }
//
//   // async validate(
//   //   accessToken: string,
//   //   refreshToken: string,
//   //   profile: Profile,
//   //   done: VerifyCallback,
//   // ): Promise<any> {
//   //   const { id, displayName, emails } = profile;
//   //   const email = emails ? emails[0].value : null;
//   //
//   //   const user = await this.prismaService.user.findUnique({
//   //     where: {
//   //       googleId: id,
//   //     },
//   //   });
//   //
//   //   if (user) {
//   //     done(null, user);
//   //   } else {
//   //     const newUser = await this.prismaService.user.create({
//   //       data: {
//   //         googleId: id,
//   //         email,
//   //         displayName,
//   //       },
//   //     });
//   //     done(null, newUser);
//   //   }
//   // }
// }
