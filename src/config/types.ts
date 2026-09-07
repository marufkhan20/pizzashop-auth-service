const TYPES = {
  UserRepository: Symbol.for("UserRepository"),
  RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  UserService: Symbol.for("UserService"),
  HashService: Symbol.for("HashService"),
  TenantService: Symbol.for("TenantService"),
  AuthController: Symbol.for("AuthController"),
  TenantController: Symbol.for("TenantController"),
  logger: Symbol.for("logger"),
  TokenService: Symbol.for("TokenService"),
};

export default TYPES;
