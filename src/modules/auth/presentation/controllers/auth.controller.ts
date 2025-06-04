import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  AuthUseCase,
  ChangePasswordDto,
  JwtAuthGuard,
  LoginDto,
  RegisterDto,
} from '@/modules/auth/application';
import { CurrentUser } from '@/modules/users/application';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' },
            roles: { type: 'array', items: { type: 'object' } },
          },
        },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authUseCase.login(loginDto);
      return {
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        isActive: { type: 'boolean' },
        isEmailVerified: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authUseCase.register(registerDto);
      return {
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid old password' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authUseCase.changePassword(
        user.id,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
