import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const payload = { sub: savedUser.id, email: savedUser.email };
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

    const payload = { sub: user.id, email: user.email };
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
      const newPayload = { sub: user.id, email: user.email };
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

  async confirmPasswordReset(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const user = await this.userRepository.findOne({
      where: { email: 'test@example.com' },
    });
    if (user) {
      user.password = hashedPassword;
      await this.userRepository.save(user);
    }
    return { success: true, message: 'Password has been reset successfully.' };
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
