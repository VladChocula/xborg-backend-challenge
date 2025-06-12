import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

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
    it('should successfully signup user', async () => {
      mockUserRepository.create.resolves(mockUser);

      const authResponse = await userService.signup(mockSignupRequest);

      expect(authResponse).toEqual(mockUser);
    });

    it('signup service throws an error if userRespository.create() errors', async () => {
      const error = new Error('DB failure');
      mockUserRepository.create.rejects(error);

      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        error,
      );
    });

    it('UserRepository throws error if input is missing required fields', async () => {
      const badPayload = {
        address: '',
        userName: '',
        email: '',
        firstName: '',
        lastName: '',
      };

      mockUserRepository.create.rejects(new Error('Invalid input'));

      await expect(userService.signup(badPayload)).rejects.toThrow(
        'Invalid input',
      );
    });
  });
});
