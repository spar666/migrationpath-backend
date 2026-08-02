import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { app_role } from './roles.enum';
import { Profile } from '../user-profile/entities/profile.entity';
import { NotificationPreference } from '../notifications/entities/notification.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(NotificationPreference)
    private readonly preferencesRepository: Repository<NotificationPreference>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      full_name: dto.fullName,
    });

    const savedUser = await this.userRepository.save(user);

    // A user without its 1:1 `profiles` row makes every /users/me call 404, so
    // provision the companion rows here rather than leaving the account in a
    // half-created state. A failure to create them must not fail the sign-up —
    // both are self-healing on read.
    await this.provisionUserRecords(savedUser);

    // `role` must be on the token: RolesGuard reads req.user.role, which is
    // populated from this payload by JwtStrategy.validate().
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: this.sanitizeUser(savedUser),
      access_token: accessToken,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: this.sanitizeUser(user),
      access_token: accessToken,
    };
  }

  private async provisionUserRecords(user: User): Promise<void> {
    try {
      await this.profileRepository.save(
        this.profileRepository.create({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_admin: user.role === app_role.ADMIN,
        }),
      );
      await this.preferencesRepository.save(
        this.preferencesRepository.create({ user_id: user.id }),
      );
    } catch (error) {
      this.logger.warn(
        `Could not provision profile/preferences for ${user.id}: ${
          (error as Error).message
        }`,
      );
    }
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

      if (!user) {
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
      if (!user) {
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

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a reset link has been sent.',
      };
    }
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  /**
   * DISABLED. The previous implementation ignored `token` entirely and reset
   * the password of a hardcoded `test@example.com` account — any caller could
   * take over that account, and no real user could ever reset their password.
   *
   * Do not re-enable until there is a real password_reset_tokens table with
   * single-use, hashed, short-TTL tokens issued by requestPasswordReset().
   */
  async confirmPasswordReset(_token: string, _newPassword: string) {
    this.logger.warn(
      'confirmPasswordReset called but password reset is not implemented',
    );
    throw new ServiceUnavailableException(
      'Password reset is not available yet. Please contact support.',
    );
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
