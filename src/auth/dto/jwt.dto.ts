export interface JwtDto {
  /**
   * User id (subject)
   */
  sub: string; // chuẩn JWT, thay vì userId

  /**
   * User email
   */
  email?: string;

  /**
   * Username
   */
  username?: string;

  /**
   * User roles (optional)
   */
  role?: string;

  /**
   * Issued at (UNIX timestamp)
   */
  iat: number;

  /**
   * Expiration time (UNIX timestamp)
   */
  exp: number;
}
