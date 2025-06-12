import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SiweService } from './../src/siwe/siwe.service';
import { JwtService } from './../src/auth/jwt.service';
import { UserClientAPI } from 'lib-server';

describe('UserController e2e', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockAddress = '0x1234567890abcdef';
  const mockUser = {
    id: 'testUser-id-1',
    address: mockAddress,
    email: 'test@example.com',
    userName: 'testUser',
  };

  const mockSiweService = {
    verifyMessage: jest.fn().mockResolvedValue({ address: mockAddress }),
  };

  const mockUserClientAPI = {
    getUser: jest.fn().mockResolvedValue(mockUser),
    signUp: jest.fn().mockResolvedValue(mockUser),
  };

  const storedUser = null;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SiweService)
      .useValue(mockSiweService)
      .overrideProvider(UserClientAPI)
      .useValue(mockUserClientAPI)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /user/signup', () => {
    it('should sign up a new user (mocked)', async () => {
      const signupPayload = {
        message: 'mock_siwe_message',
        signature: 'mock_signature',
        userName: 'testuser',
        email: 'test@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send(signupPayload)
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    it('should return a 400 if userName is missing in payload', async () => {
      const signupPayload = {
        message: 'mock_siwe_msg',
        signature: 'mock_signature',
        email: 'test@example.com',
      };

      await request(app.getHttpServer())
        .post('/user/signup')
        .send(signupPayload)
        .expect(400);
    });

    it('should return a 500 if SIWE verification fails', async () => {
      mockSiweService.verifyMessage.mockRejectedValueOnce(null);

      const signupPayload = {
        message: 'invalidMessage',
        signature: 'invalidSignature',
        userName: 'testUser',
        email: 'test@example.com',
      };

      await request(app.getHttpServer())
        .post('/user/signup')
        .send(signupPayload)
        .expect(500);
    });
  });

  describe('POST /user/login', () => {
    it('should login existing user', async () => {
      const loginPayload = {
        message: 'mock_siwe_message',
        signature: 'mock_signature',
      };

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginPayload)
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    it('should return a 401 if SIWE verification fails', async () => {
      mockSiweService.verifyMessage.mockRejectedValueOnce(null);

      const loginPayload = {
        message: 'invalidMessage',
        signature: 'invalidSignature',
      };

      await request(app.getHttpServer())
        .post('/user/login')
        .send(loginPayload)
        .expect(401);
    });

    it('should return a 500 if user not found', async () => {
      mockUserClientAPI.getUser.mockResolvedValueOnce(null);

      const loginPayload = {
        message: 'mockSiweMessage',
        signature: 'mockSignature',
      };

      await request(app.getHttpServer())
        .post('/user/login')
        .send(loginPayload)
        .expect(500);
    });

    it('should return a 400 if signature is missing in payload', async () => {
      const loginPayload = {
        message: 'mockSiweMessage',
      };

      await request(app.getHttpServer())
        .post('/user/login')
        .send(loginPayload)
        .expect(400);
    });
  });

  describe('GET /user', () => {
    it('should return the current user after authentication', async () => {
      const { token } = await jwtService.buildAuthRes(mockUser);

      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          userName: expect.any(String),
        }),
      );

      expect(response.body).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        userName: mockUser.userName,
      });
    });

    it('should return a 401 when called witout authorization header', async () => {
      await request(app.getHttpServer()).get('/user').expect(401);
    });

    it('should return a 401 when called with a malformed token', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .set('Authoirzation', 'Bearer malformed.token')
        .expect(401);
    });

    it('should return a 401 when called with unknown user', async () => {
      mockUserClientAPI.getUser.mockResolvedValueOnce(null);

      const token = await jwtService.buildAuthRes(mockUser);
      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });
});
