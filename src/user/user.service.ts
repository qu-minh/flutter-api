import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException(
        `Email ${createUserDto.email} đã được đăng ký.`,
      );
    }

    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException(
        `Tên đăng nhập ${createUserDto.username} đã được đăng ký.`,
      );
    }

    const user: User = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.birthday = createUserDto.birthday;
    user.gender = createUserDto.gender;
    user.username = createUserDto.username;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async findAllUser(query: QueryUserDto): Promise<{
    items: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const q = query?.q;

    const skip = (page - 1) * limit;

    const where = q
      ? [
          { name: ILike(`%${q}%`) },
          { email: ILike(`%${q}%`) },
          { username: ILike(`%${q}%`) },
        ]
      : undefined;

    const [items, total] = await this.userRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { name: 'ASC' },
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const result = await this.userRepository.update(id, dto);

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    return this.userRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<string> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return `Đã xóa người dùng Thành công!`;
  }
}
