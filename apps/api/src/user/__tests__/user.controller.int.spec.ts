import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserController int', () => {
    const mockUserRepository: StubbedInstance<UserRepository> =
        stubInterface<UserRepository>();
    let userService: UserService;
    let userController: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                UserService,
                UserController,
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    describe('getUser', () => {
        it('should return user when valid id or address is provided', async () => {
            const searchQuery = { id: 'uuid', address: ''};
            mockUserRepository.find.resolves(mockUser);
            const getUserResult = await userController.getUser(searchQuery);
            expect(getUserResult).toEqual(mockUser);
        });
    })

    describe('signup', () => {
        it('user.repository throws an error when user.service sends an empty payload', async () => {
            mockUserRepository.create.rejects(new Error('Missing user information'));
            const firstName = '';
            const lastName = '';

            const userSignupData = {
                address: '',
                userName: '',
                email: '',
                profile: {
                    create: {
                        firstName,
                        lastName,
                    },
                },
            };
            await expect(userController.signup(userSignupData)).rejects.toThrow('Missing user information');
        });
    });
});