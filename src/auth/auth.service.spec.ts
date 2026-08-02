import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Profile } from '../user-profile/entities/profile.entity';
import { NotificationPreference } from '../notifications/entities/notification.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  const mockUser = {
    id: 'user-1',
    email: 'jane@example.com',
    password: '',
    full_name: 'Jane Doe',
  };

  beforeEach(async () => {
    // Note: the previous version of this spec only registered AuthService
    // with no mocked dependencies. AuthService's constructor requires a
    // User repository and JwtService, so Nest's DI container would throw
    // "cannot resolve dependencies" compiling that testing module — this
    // spec would never have actually run. Fixed here with real mocks.
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn(),
    };

    // AuthService gained profile and notification-preference repositories when
    // signup started seeding those rows. Without them registered here, Nest
    // fails to resolve the constructor and every test in this file errors
    // before it runs — which is what was happening.
    const profileRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    const preferencesRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Profile), useValue: profileRepository },
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: preferencesRepository,
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('creates a new user with a hashed password and returns a token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashed',
      });

      const result = await service.signUp({
        email: 'jane@example.com',
        password: 'plaintext-password',
        fullName: 'Jane Doe',
      });

      expect(userRepository.save).toHaveBeenCalled();
      const savedArg = userRepository.create.mock.calls[0][0];
      expect(savedArg.password).not.toBe('plaintext-password');
      expect(result.access_token).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('rejects signup when the email is already registered', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.signUp({
          email: 'jane@example.com',
          password: 'whatever',
          fullName: 'Jane Doe',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('signIn', () => {
    it('returns a token for valid credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      const result = await service.signIn({
        email: 'jane@example.com',
        password: 'correct-password',
      });

      expect(result.access_token).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    /**
     * RolesGuard reads `role` off the JWT. Before the security fix the claim
     * was never signed into the token, so the guard had nothing to compare and
     * every route it protected was effectively unguarded.
     *
     * Nothing else in the suite covers this, and the failure is silent — the
     * token still verifies, users still sign in, and admin routes quietly stop
     * being admin routes. Hence the explicit assertions.
     */
    it('signs the role into the token so RolesGuard can enforce it', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashed,
        role: 'admin',
      });

      await service.signIn({
        email: 'jane@example.com',
        password: 'correct-password',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', role: 'admin' }),
      );
    });

    it('does not invent a role for a user that has none', async () => {
      // A missing role must stay missing. Defaulting it here — to 'user' or
      // anything else — would put an unearned claim on the token.
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await service.signIn({
        email: 'jane@example.com',
        password: 'correct-password',
      });

      const payload = jwtService.signAsync.mock.calls[0][0];
      expect(payload.role).toBeUndefined();
    });

    it('rejects sign-in for a nonexistent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.signIn({ email: 'nobody@example.com', password: 'x' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects sign-in for an incorrect password', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await expect(
        service.signIn({
          email: 'jane@example.com',
          password: 'wrong-password',
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
