import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp, OtpDocument } from './otp.schema';
import { generateOtp } from 'src/shared/helpers/otp_functions';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  /**
   * Generates an OTP with the given duration, user ID, and type.
   *
   * @param {string} duration - The duration for which the OTP is valid. Defaults to '20m'.
   * @param {Types.ObjectId} user_id - The ID of the user for whom the OTP is generated.
   * @param {string} type - The type of the OTP.
   * @return {Promise<OtpDocument>} - A promise that resolves to the created OTP document.
   * @throws {Error} - If the duration is invalid.
   */
  async generate(
    duration: string = '20m',
    user_id: Types.ObjectId,
    type: string,
  ) {
    try {
      const otp = generateOtp();
      let expiry: Date;
      if (duration.slice(-1) === 'm') {
        expiry = new Date();
        expiry.setMinutes(
          expiry.getMinutes() + parseInt(duration.slice(0, -1)),
        );
      } else if (duration.slice(-1) === 'h') {
        expiry = new Date();
        expiry.setHours(expiry.getHours() + parseInt(duration.slice(0, -1)));
      } else if (duration.slice(-1) === 'd') {
        expiry = new Date();
        expiry.setDate(expiry.getDate() + parseInt(duration.slice(0, -1)));
      } else if (duration.slice(-1) === 's') {
        expiry = new Date();
        expiry.setSeconds(
          expiry.getSeconds() + parseInt(duration.slice(0, -1)),
        );
      } else {
        throw new Error('Invalid duration');
      }

      const createdOtp = await this.otpModel.create({
        token: otp,
        expiry,
        user_id: new Types.ObjectId(user_id),
        type,
      });

      return createdOtp;
    } catch (error) {
      this.logger.error(`Error generating OTP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifies an OTP token.
   *
   * @param {string} otpToken - The OTP token to verify.
   * @return {Promise<OtpDocument | null>} A promise that resolves to the verified OTP document, or null if the OTP token is invalid or expired.
   * @throws {Error} If there is an error verifying the OTP token.
   */
  async verifyOtp(otpToken: string) {
    try {
      const otp = await this.otpModel.findOne({ token: otpToken });

      if (!otp) {
        return null;
      }

      if (otp.expiry < new Date()) {
        await this.otpModel.deleteOne({ _id: otp._id });
        return null;
      }

      const deletedOtp = await this.otpModel.findOneAndDelete({ _id: otp._id });

      return deletedOtp;
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`);
      throw error;
    }
  }
}
