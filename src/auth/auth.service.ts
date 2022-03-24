import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { RegisteredVia } from 'src/user/types/RegisteredVia';
import { ApplicationException } from 'src/utils/exception/ApplicationException';
import { loginUserDTO } from './dto/loginUser.dto';
import { registerUserDTO } from './dto/registerUser.dto';
import { googleLoginDTO } from './dto/googleLogin.dto';
import { JWTPayload } from './types/payload';
import { Password } from './utils/password';
import { nanoid } from 'nanoid';
import { JWT } from './utils/token';
import { GoogleOAuth } from './utils/GoogleOAuth';
import { Model } from 'mongoose';
import { EmailWorker } from 'src/email/email.service';
import { ConfigDocument } from 'src/config/entities/config.entity';

@Injectable()
export class authService {
  private readonly logger = new Logger('userService');

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    @InjectModel('Config')
    private readonly configModel: Model<ConfigDocument>,
    public Password: Password,
    public Token: JWT,
    public GoogleOAuth: GoogleOAuth,
    public EmailWorker: EmailWorker,
  ) {}

  async registerUser(projectId: string, registerUserDTO: registerUserDTO) {
    const { name, email, password } = registerUserDTO;

    const config = await this.configModel.findOne({ projectId: projectId });
    if (!config) {
      throw new ApplicationException('Invalid Project Id', 400);
    }
    if (!config.enabled) {
      throw new ApplicationException(
        'Cannot perform this action right now',
        400,
      );
    }

    const existingUser = await this.userModel.findOne({ email: email });
    if (existingUser) {
      throw new ApplicationException('Email already exists', 400);
    }

    const hashedPassword = await this.Password.toHash(password);

    const user = await this.userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      registeredVia: 'credentials',
      projectId: projectId,
    });

    // TODO: send verification email
    this.EmailWorker.sendVerificationEmail({
      email: user.email,
      id: user.id,
      projectId,
    }).then();

    const token = this.Token.newToken<JWTPayload & { projectId: string }>({
      email: email,
      id: user.id,
      projectId: projectId,
    });

    return { user, token };
  }

  async loginUser(projectId: string, loginUserDTO: loginUserDTO) {
    const { email, password } = loginUserDTO;

    const config = await this.configModel.findOne({ projectId: projectId });
    if (!config) {
      throw new ApplicationException('Invalid Project Id', 400);
    }
    if (!config.enabled) {
      throw new ApplicationException(
        'Cannot perform this action right now',
        400,
      );
    }

    const existingUser = await this.userModel.findOne({ email: email });
    if (!existingUser) {
      throw new ApplicationException('Invalid Credentials', 400);
    }

    const bool = await this.Password.compare(existingUser.password, password);
    if (!bool) {
      throw new ApplicationException('Invalid Credentials', 400);
    }

    const token = this.Token.newToken({
      email: email,
      id: existingUser.id,
      projectId: projectId,
    });

    return { user: existingUser, token };
  }

  async verifyUserRegistration(token: string) {
    const { id, fromEmail, projectId } = this.Token.verifyToken<
      JWTPayload & { fromEmail: boolean; projectId: string }
    >(token);

    const config = await this.configModel.findOne({ projectId: projectId });
    if (!config) {
      throw new ApplicationException('Invalid Project Id', 400);
    }
    if (!config.enabled) {
      throw new ApplicationException(
        'Cannot perform this action right now',
        400,
      );
    }

    if (!fromEmail) {
      throw new ApplicationException('Invalid token', 400);
    }
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new ApplicationException('User is not registered', 400);
    }

    existingUser.emailVerified = true;
    await existingUser.save();
    const newToken = this.Token.newToken({
      email: existingUser.email,
      id: id,
      projectId,
    });
    return { token: newToken, message: 'Email verified successfully' };
  }

  async loginWithGoogle(projectId: string, googleLoginDTO: googleLoginDTO) {
    const config = await this.configModel.findOne({ projectId: projectId });
    if (!config) {
      throw new ApplicationException('Invalid Project Id', 400);
    }
    if (!config.enabled) {
      throw new ApplicationException(
        'Cannot perform this action right now',
        400,
      );
    }

    const { email, idToken } = googleLoginDTO;
    const payload = await this.GoogleOAuth.verifyGoogleIdToken(idToken);

    const existingUser = await this.userModel.findOne({ email: payload.email });

    let sendMail = false;
    let newUser: any;
    if (!existingUser) {
      // create new user
      newUser = await this.userModel.create({
        name: payload.name,
        email: payload.email,
        emailVerified: payload.email_verified,
        registeredVia: RegisteredVia.google,
        password: nanoid(),
      });

      if (!newUser.emailVerified) {
        // TODO: send verification email
        this.EmailWorker.sendVerificationEmail({
          email: newUser.email,
          id: newUser.id,
          projectId,
        }).then();
        sendMail = true;
      }
    }

    const token = this.Token.newToken({
      email: payload.email,
      id: newUser ? newUser.id : existingUser.id,
      projectId,
    });

    console.log(payload);

    return {
      message: sendMail && 'Your email is not verified. Mail has been sent.',
      user: existingUser || newUser,
      token: token,
    };
  }
}
