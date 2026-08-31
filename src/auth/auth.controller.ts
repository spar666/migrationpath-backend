import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Self-service account endpoints (`POST /auth/signup` and the two
 * `/auth/password-reset/*` routes) were removed with the end-user account
 * layer. What is left is the sign-in path, which admin depends on: there is no
 * separate admin login — an admin authenticates here like anyone else and is
 * distinguished only by the `role` claim RolesGuard reads off the token.
 *
 * Accounts are provisioned out of band now. Nothing in the API creates one.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns access_token and user info',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out' })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  signOut() {
    return this.authService.signOut();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out' })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  logout() {
    return this.authService.signOut();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiResponse({ status: 200, description: 'Returns a new access token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns authenticated user object',
  })
  @ApiResponse({ status: 401, description: 'Token invalid or expired' })
  getMe(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    return this.authService.getUser(token);
  }
}
