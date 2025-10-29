import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { connectInMemoryDB, clearDB, closeDB } from './setup/test-db';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/user/schemas/user.schema';
import { Token } from '../../src/user/schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';

describe('Theme Flow (E2E)', () => {
  let app: INestApplication;
  let userModel;
  let tokenModel;
  let uri: string;
  let jwtToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    uri = await connectInMemoryDB();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forRoot(uri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    tokenModel = moduleFixture.get(getModelToken(Token.name));

    console.log('✅ Connected to in-memory MongoDB:', uri);

    // 1️⃣ Register
    const captchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);
    const { captchaId, answer } = captchaRes.body;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Theme User',
        email: 'theme@example.com',
        captchaId,
        captchaAnswer: Number(answer),
      })
      .expect(201);

    // 2️⃣ Verify email
    const user = await userModel.findOne({ email: 'theme@example.com' });
    const tokenDoc = await tokenModel.findOne({ user: user._id });
    const verificationToken = tokenDoc.token;

    const encodedPassword = Buffer.from('123456').toString('base64');
    await request(app.getHttpServer())
      .post(`/user/set-password?token=${verificationToken}`)
      .send({
        password: encodedPassword,
        confirmPassword: encodedPassword,
      })
      .expect(201);

    // 3️⃣ Login
    const loginCaptchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);
    const { captchaId: loginCaptchaId, answer: loginCaptchaAnswer } =
      loginCaptchaRes.body;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'theme@example.com',
        password: encodedPassword,
        captchaId: loginCaptchaId,
        captchaAnswer: Number(loginCaptchaAnswer),
      })
      .expect(201);

    jwtToken = loginRes.body.token;
    expect(jwtToken).toBeDefined();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
    await app.close();
  });

  it('should change theme successfully', async () => {
    const res = await request(app.getHttpServer())
      .patch('/theme/change')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ theme: '#000000' })
      .expect(200);

    expect(res.body).toMatchObject({
      message: 'Theme updated successfully',
      ok: true,
    });
    console.log('✅ Theme changed successfully');
  });

  it('should add a custom theme successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/theme/add-custom-theme')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Ocean Blue',
        hex: '#0077ff',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      message: 'Custom theme added successfully',
      ok: true,
    });
    console.log('✅ Custom theme added successfully');
  });

  it('should delete a custom theme successfully', async () => {
    // First add a theme
    await request(app.getHttpServer())
      .post('/theme/add-custom-theme')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Sunset Orange',
        hex: '#ff6600',
      })
      .expect(201);

    // Then delete
    const res = await request(app.getHttpServer())
      .delete('/theme/delete-custom-theme')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: 'Sunset Orange' })
      .expect(200);

    expect(res.body).toMatchObject({
      message: 'Custom theme deleted successfully',
      ok: true,
    });
    console.log('✅ Custom theme deleted successfully');
  });
});
