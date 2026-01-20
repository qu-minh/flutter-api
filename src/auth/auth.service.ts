import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dio/login.dto';

// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
      select: ['id', 'name', 'birthday', 'gender', 'email', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...this.generateToken(user),
    };
  }

  generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
