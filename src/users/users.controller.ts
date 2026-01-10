import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  // Get Danh sách người dùng
  @Get()
  getUsers() {
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Alice Johnson' },
    ];
  }

  // Post Tạo mới người dùng
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return {
      message: 'User created successfully',
      data: dto,
    };
  }
}
