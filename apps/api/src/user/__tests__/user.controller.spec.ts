import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { mockSignupRequest, mockUser } from './mocks';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
    const mockUserRepository: StubbedInstance<UserRepository> =
        stubInterface<UserRepository>();
    const mockUserService: StubbedInstance<UserService> =
        stubInterface<UserService>();

    let userController: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                UserController,
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
    });

    describe('signup', () => {
        it('should call userService.signup and return the user', async () => {
            mockUserService.signup.resolves(mockUser);

            const signupResult = await userController.signup(mockSignupRequest);
            expect(mockUserService.signup.calledWith(mockSignupRequest)).toBe(true);
            expect(signupResult).toEqual(mockUser);
        });

        it('should throw an error if signup call is made with an empty payload', async () => {
            mockUserService.signup.rejects(new Error('Missing user information'));
            const firstName = '';
            const lastName = '';
            const userSignupData = { 
                address: '',
                userName: '',
                email: '',
                profile: {
                    create: {
                        firstName,
                        lastName
                    },
                },
            };
            await expect(userController.signup(userSignupData)).rejects.toThrow('Missing user information');
        });
    });

    describe('getUser', () => {
        it('should call userRespository.find and return signed up user', async () => {
            mockUserService.signup.resolves(mockUser);
            mockUserRepository.find.resolves(mockUser);
            const searchQuery = { id: 'uuid', address: 'someethaddress' };
            const getUserResult = await userController.getUser(searchQuery);
            expect(mockUserRepository.find.calledWith(searchQuery)).toBe(true);
            expect(getUserResult).toEqual(mockUser);
        });

        it('throws an error when called with empty fielded payload', async () => {
            mockUserService.signup.resolves(mockUser);
            const searchQuery = { id: '', address: ''};
            mockUserRepository.find.rejects(new NotFoundException());
            expect(userController.getUser(searchQuery)).rejects.toThrow(new NotFoundException());
        });

        it('should throw an exception when undefined is passed in', async () => {
            await expect(userController.getUser(undefined as any)).rejects.toThrow();
        });
    });


});