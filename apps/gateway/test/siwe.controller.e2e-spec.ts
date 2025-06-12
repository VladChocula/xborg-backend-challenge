import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SiweService } from './../src/siwe/siwe.service';

describe('SiweController e2e', () => {
    let app: INestApplication;
    const validEthAddress = '0x1234567890abcdef1234567890abcdef12345678';

    const mockSiweService = {
        createNonce: jest.fn().mockImplementation((address) => `mock-nonce-for-${address}`),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SiweService)
            .useValue(mockSiweService)
            .compile();
        
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        await app.close();
    });

    describe('GET /nonce/:address', () => {
        it('should return a nonce for a valid address', async () => {
            const address = '0x1234567890abcdef';
            const response = await request(app.getHttpServer())
                .get(`/siwe/nonce/${address}`)
                .expect(200);
            expect(response.text).toBe(`mock-nonce-for-${address}`);
        });

        it('should return 400 for missing address', async () => {
            const response = await request(app.getHttpServer())
                .get(`/siwe/nonce/`)
                .expect(404);
        });

        it('should return different nonces for repeated calls', async () => {
            mockSiweService.createNonce
                .mockResolvedValueOnce('nonce-1')
                .mockResolvedValueOnce('nonce-2');

            const response1 = await request(app.getHttpServer())
                .get(`/siwe/nonce/${validEthAddress}`)
                .expect(200);

            const response2 = await request(app.getHttpServer())
                .get(`/siwe/nonce/${validEthAddress}`)
                .expect(200);

            expect(response1.text).toBe('nonce-1');
            expect(response2.text).toBe('nonce-2');
            expect(response1.text).not.toEqual(response2.text);
        });

        it('should return 500 if SiweService throws an exception', async () => {
            const address = '0x1234567890abcdef';
            mockSiweService.createNonce.mockImplementationOnce(() => {
                throw new Error('Simulated internal failure');
            });

            const response = await request(app.getHttpServer())
                .get(`/siwe/nonce/${address}`)
                .expect(500);
        });

    });
})