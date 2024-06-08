import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SignInUseCase, SignUpUseCase } from '@core/auth/application';
import { LoginDto, RegisterDto, UserModel } from '@core/auth/domain';

import { JwtAuthGuard } from '../../infraestructure';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  @ApiOperation({ summary: 'Sign up' })
  @Post('signup')
  signup(@Body() createAuthDto: RegisterDto) {
    return this.signUpUseCase.execute(createAuthDto);
  }

  @ApiOperation({ summary: 'Sign in' })
  @Post('signin')
  signin(@Body() createAuthDto: LoginDto) {
    return this.signInUseCase.execute(createAuthDto);
  }

  @ApiOperation({
    summary: 'Get me',
    description: 'Get current user with token',
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req): UserModel {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return req.user as UserModel;
  }

  // @Post('refresh-token')
  // refreshToken(@Body() createAuthDto: unknown) {
  //   return this.authService.refreshToken(createAuthDto);
  // }

  // @Get('logout')
  // logout(@Body() createAuthDto: unknown) {
  //   return this.authService.logout(createAuthDto);
  // }
}
