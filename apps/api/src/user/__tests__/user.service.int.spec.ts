import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService int', () => {
  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        UserService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('signup', () => {
    it('should call repository.create with correct user data and return the result', async () => {
      mockUserRepository.create.resolves(mockUser);

      const signupResult = await userService.signup(mockSignupRequest);

      expect(mockUserRepository.create.calledOnce).toBe(true);
      expect(
        mockUserRepository.create.calledWithMatch({
          address: mockSignupRequest.address,
          userName: mockSignupRequest.userName,
          email: mockSignupRequest.email,
          profile: {
            create: {
              firstName: mockSignupRequest.firstName,
              lastName: mockSignupRequest.lastName,
            },
          },
        }),
      ).toBe(true);
      expect(signupResult).toEqual(mockUser);
    });

    it('should throw an error if repository.create throws', async () => {
      mockUserRepository.create.rejects(
        new Error('Error when creating user in database.'),
      );
      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        'Error when creating user in database.',
      );
    });
  });
});
