import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra email đã tồn tại chưa
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException(
        `Email ${createUserDto.email} đã được đăng ký.`,
      );
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException(
        `Tên đăng nhập ${createUserDto.username} đã được đăng ký.`,
      );
    }

    // Tạo user mới nếu chưa tồn tại
    const user: User = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.age = createUserDto.age ?? -1;
    user.gender = createUserDto.gender;
    user.username = createUserDto.username;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const result = await this.userRepository.update(id, dto);

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    return this.userRepository.findOneBy({ id });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
