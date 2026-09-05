import bcrypt from "bcrypt";

export class HashService {
  async create(password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async verify({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
