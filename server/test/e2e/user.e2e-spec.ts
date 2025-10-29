import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { disconnect } from 'mongoose';
import { clearDB, closeDB, connectInMemoryDB } from './setup/test-db';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Token } from 'src/user/schemas/token.schema';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let uri: string;
  let jwtToken: string;
  let userModel;
  let tokenModel;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    // 🧩 Start in-memory MongoDB and get URI
    uri = await connectInMemoryDB();

    // 🧩 Load app module connected to memory DB
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forRoot(uri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    tokenModel = moduleFixture.get(getModelToken(Token.name));

    // 1️⃣ Register
    const captchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);
    const { captchaId, answer } = captchaRes.body;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Theme User',
        email: 'user@example.com',
        captchaId,
        captchaAnswer: Number(answer),
      })
      .expect(201);

    // 2️⃣ Verify email
    const user = await userModel.findOne({ email: 'user@example.com' });
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
        email: 'user@example.com',
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

  // 3️⃣ Get current profile
  it('/user/me (GET) → should return logged-in user profile', async () => {
    await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });

  // 4️⃣ Update profile
  it('/user/me (PATCH) → should update user name', async () => {
    await request(app.getHttpServer())
      .patch('/user/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: 'Aditya Test' })
      .expect(200);
  });

  //   // 5️⃣ Change password
  const encodedPassword = Buffer.from('123456').toString('base64');
  const encodedNewPassword = Buffer.from('654321').toString('base64');

  it('/user/update-password (PATCH) → should change password successfully', async () => {
    await request(app.getHttpServer())
      .patch('/user/update-password')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        oldPassword: encodedPassword,
        newPassword: encodedNewPassword,
        confirmPassword: encodedNewPassword,
      })
      .expect(200);
  });

  // 6️⃣ Login again with new password
  it('/auth/login → should allow login with new password', async () => {
    const loginCaptchaRes = await request(app.getHttpServer())
      .get('/user/captcha')
      .expect(200);
    const { captchaId: loginCaptchaId, answer: loginCaptchaAnswer } =
      loginCaptchaRes.body;

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: encodedNewPassword,
        captchaId: loginCaptchaId,
        captchaAnswer: Number(loginCaptchaAnswer),
      })
      .expect(201);

    jwtToken = login.body.token;
    expect(jwtToken).toBeDefined();
  });

  //   // 7️⃣ Forgot Password (mock email flow)
  it('/user/forgot-password (POST) → should send forgot password mail', async () => {
    await request(app.getHttpServer())
      .post('/user/forgot-password')
      .send({ email: 'user@example.com' })
      .expect(201);
  });

  //   // 8️⃣ Get all users
  it('/user (GET) → should return paginated users', async () => {
    const res = await request(app.getHttpServer())
      .get('/user?limit=5')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });

  //   // 🔟 Delete self
  it('/user/me (DELETE) → should delete own account', async () => {
    await request(app.getHttpServer())
      .delete('/user/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });
});
