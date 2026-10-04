import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';

/**
 * Sign-in and token handling only.
 *
 * `signUp` and the password-reset pair were removed with the end-user account
 * layer. `signUp` also owned `provisionUserRecords`, which seeded the companion
 * `profiles` and `notification_preferences` rows — with no account creation
 * path left in the API, this service no longer touches either table, and its
 * repositories came out with it.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(dto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // `role` must be on the token: RolesGuard reads req.user.role, which is
    // populated from this payload by JwtStrategy.validate().
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: this.sanitizeUser(user),
      access_token: accessToken,
    };
  }

  async signOut() {
    // In a stateless JWT system, client deletes the token.
    // If we wanted to blacklist tokens, we would implement it here.
    return { message: 'Signed out successfully' };
  }

  async getUser(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.role !== 'admin') {
        throw new UnauthorizedException('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async validateUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required');
      }
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || user.role !== 'admin') {
        throw new UnauthorizedException('User not found');
      }
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = await this.jwtService.signAsync(newPayload);
      return {
        access_token: newAccessToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
