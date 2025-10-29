import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { connectInMemoryDB, clearDB, closeDB } from './setup/test-db';
import { getModelToken } from '@nestjs/mongoose';
import { Token } from '../../src/user/schemas/token.schema';
import { User } from '../../src/user/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

describe('Auth Flow (E2E)', () => {
  let app: INestApplication;
  let userModel;
  let tokenModel;
  let uri: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    // 🧩 Start in-memory MongoDB and get URI
    uri = await connectInMemoryDB();

    // 🧩 Load app module connected to memory DB
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forRoot(uri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    tokenModel = moduleFixture.get(getModelToken(Token.name));

    console.log('✅ Connected to in-memory MongoDB:', uri);
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB(); // this handles mongoose close + mongoServer.stop()
    await app.close();
  });

  it('should register, verify via email link, set password, and login successfully', async () => {
    // 1️⃣ Get captcha for registration
    const captchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);

    const { captchaId, answer } = captchaRes.body;

    // 2️⃣ Register user
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        captchaId,
        captchaAnswer: Number(answer),
      })
      .expect(201);

    expect(registerRes.body.message).toBe('Verification email sent');
    console.log('✅ Registration step passed');

    // 3️⃣ Simulate clicking email verification link
    const user = await userModel.findOne({ email: 'test@example.com' });
    const tokenDoc = await tokenModel.findOne({ user: user._id });
    const verificationToken = tokenDoc.token;

    // 4️⃣ Set password (simulate verified email)
    const encodedPassword = Buffer.from('123456').toString('base64');
    await request(app.getHttpServer())
      .post(`/user/set-password?token=${verificationToken}`)
      .send({
        password: encodedPassword,
        confirmPassword: encodedPassword,
      })
      .expect(201);

    console.log('✅ Password set successfully');

    // 5️⃣ Get a NEW captcha for login
    const loginCaptchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);

    const { captchaId: loginCaptchaId, answer: loginCaptchaAnswer } =
      loginCaptchaRes.body;

    // 6️⃣ Login using new captcha
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: encodedPassword,
        captchaId: loginCaptchaId,
        captchaAnswer: Number(loginCaptchaAnswer),
      })
      .expect(201);

    expect(loginRes.body).toHaveProperty('token');
    console.log('✅ Login successful');

    let accessToken = loginRes.body.accessToken;

    await request(app.getHttpServer())
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(200);
    console.log('✅ Logout successful');
  });
});
