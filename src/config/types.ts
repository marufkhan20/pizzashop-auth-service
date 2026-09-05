const TYPES = {
  UserRepository: Symbol.for("UserRepository"),
  RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
  UserService: Symbol.for("UserService"),
  HashService: Symbol.for("HashService"),
  AuthController: Symbol.for("AuthController"),
  logger: Symbol.for("logger"),
  TokenService: Symbol.for("TokenService"),
};

export default TYPES;
