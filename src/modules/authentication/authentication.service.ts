import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './authentication.schema';
import { Model, Types } from 'mongoose';
import { ErrorResponse, SuccessResponse } from 'src/shared/responses';
import { statusCodes } from 'src/shared/constants';
import { AccessTokenService } from './tokens/accesstoken.service';
import { RefreshTokenService } from './tokens/refreshtoken.service';
import { EmailService } from '../emails/email.service';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly ATS: AccessTokenService,
    private readonly RTS: RefreshTokenService,
    private readonly email: EmailService,
    private readonly otp: OtpService,
  ) {}

  async register(
    name: string,
    email: string,
    date_of_birth: string,
    password: string,
    phone_number: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      return {
        error: 'User already exists',
        code: statusCodes.CONFLICT,
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      date_of_birth,
      password: hashedPassword,
      role: 'User',
      phone_number: phone_number,
    });
    const OTP = await this.otp.generate('20m', user._id, 'Email Verification');

    const subject = 'Verification Code';
    const body =
      'Your verification code is: ' +
      OTP.token +
      '. It will expire in 20 minutes.';
    await this.email.sendEmail(user.email, subject, body);
    await this.RTS.addNewToken(user._id);
    const accessToken = this.ATS.generateAccessToken(user);
    return {
      message: 'User created successfully',
      code: statusCodes.CREATED,
      data: {
        account: user,
        accessToken,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    await this.RTS.replaceToken(user._id);
    const accessToken = this.ATS.generateAccessToken(user);
    return {
      message: 'User logged in successfully',
      code: statusCodes.OK,
      data: {
        account: user,
        accessToken,
      },
    };
  }

  async logout(userId: Types.ObjectId) {
    if (!userId) {
      return {
        code: statusCodes.BAD_REQUEST,
        error: 'Cannot logout. Invalid user ID.',
      };
    }
    await this.RTS.invalidateToken(userId);
    return {
      message: 'User logged out successfully',
      code: statusCodes.OK,
      data: null,
    };
  }
  async resendOTPForVerif(email: string): Promise<SuccessResponse> {
    if (!email) {
      throw new Error(
        'One or more of the required parameters was not provided.',
      );
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      return {
        code: statusCodes.NOT_FOUND,
        message: 'Account with associated information not found.',
        data: null,
      };
    }
    if (user.verified) {
      return {
        code: statusCodes.CONFLICT,
        message: 'Account already verified.',
        data: null,
      };
    }
    const OTP = await this.otp.generate('20m', user._id, 'Email Verification');

    const subject = 'Verification Code';
    const body =
      'Your verification code is: ' +
      OTP.token +
      '. It will expire in 20 minutes.';
    await this.email.sendEmail(user.email, subject, body);
    return {
      code: statusCodes.OK,
      message: 'Email with verification code sent successfully',
      data: null,
    };
  }

  /**
   * Verifies a user using a token and user ID.
   *
   * @param {string} token - The token to verify the user.
   * @param {string} userId - The ID of the user to verify.
   * @return {Promise<SuccessResponse>} A promise that resolves to a SuccessResponse object.
   */
  async verifyUser(token: string): Promise<SuccessResponse> {
    const verified = await this.otp.verifyOtp(token);
    if (!verified) {
      return {
        code: statusCodes.UNAUTHORIZED,
        message: 'Token has expired',
        data: null,
      };
    }
    const newUser = await this.userModel.findOneAndUpdate(
      { _id: verified.user_id },
      { verified: true },
      { new: true },
    );
    return {
      code: statusCodes.OK,
      message: 'User verified successfully. You can now login.',
      data: newUser,
    };
  }

  async startPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (user) {
      const email = user.email;
      const OTP = await this.otp.generate('20m', user._id, 'Password Reset');
      const subject = 'Password Reset';
      const body = 'Use this OTP to reset your password: ' + OTP.token;
      await this.email.sendEmail(email, subject, body);
      return {
        code: statusCodes.OK,
        message: 'Email with reset instructions sent successfully',
        data: null,
      };
    } else {
      return {
        code: statusCodes.NOT_FOUND,
        message: 'Account with associated information not found.',
        data: null,
      };
    }
  }

  async endPasswordReset(
    otp: string,
    newPassword: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    const verified = await this.otp.verifyOtp(otp);
    if (!verified) {
      return {
        code: statusCodes.UNAUTHORIZED,
        error: 'Token has expired',
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(verified.user_id, {
      password: hashedPassword,
    });

    return {
      code: statusCodes.OK,
      message: 'Password reset successful',
      data: null,
    };
  }
}
