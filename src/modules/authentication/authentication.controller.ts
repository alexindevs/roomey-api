import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
  NewUserDto,
  VerifyUserDto,
  LoginUserDto,
  StartPasswordResetDto,
  EndPasswordResetDto,
  ResendOTPForVerifDto,
} from './authentication.dto';
import { Response } from 'express';
import { statusCodes } from 'src/shared/constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerUser(@Body() newUserDto: NewUserDto, @Res() res: Response) {
    const {
      first_name,
      last_name,
      email,
      date_of_birth,
      password,
      phone_number,
      gender,
    } = newUserDto;

    const response = await this.authService.register(
      first_name,
      last_name,
      email,
      date_of_birth,
      password,
      phone_number,
      gender, // Pass the gender field as well
    );

    if ('error' in response) {
      return res
        .status(response.code)
        .json({ message: response.error, code: response.code, data: null });
    } else {
      return res
        .status(response.code)
        .json({ message: response.message, data: response.data });
    }
  }

  @Post('resend-otp')
  @UsePipes(new ValidationPipe())
  async resendOTPForVerif(
    @Body() resendOTPForVerifDto: ResendOTPForVerifDto,
    @Res() res: Response,
  ) {
    const { email } = resendOTPForVerifDto;
    const response = await this.authService.resendOTPForVerif(email);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Post('verify')
  @UsePipes(new ValidationPipe())
  async verifyUser(@Body() verifyUserDto: VerifyUserDto, @Res() res: Response) {
    const { token } = verifyUserDto;
    const response = await this.authService.verifyUser(token);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { email, password } = loginUserDto;
    const response = await this.authService.login(email, password);
    if (!response) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        message: 'Invalid credentials',
        code: statusCodes.UNAUTHORIZED,
        data: null,
      });
    }
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(statusCodes.OK)
  async logoutUser(@Req() req: any, @Res() res: Response) {
    if (!req.user.userId) {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: 'No user ID provided',
        data: null,
      });
    }
    const response = await this.authService.logout(req.user.userId);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Post('start-password-reset')
  @UsePipes(new ValidationPipe())
  async startPasswordReset(
    @Body() startPasswordResetDto: StartPasswordResetDto,
    @Res() res: Response,
  ) {
    const { email } = startPasswordResetDto;
    const response = await this.authService.startPasswordReset(email);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }

  @Post('end-password-reset')
  @UsePipes(new ValidationPipe())
  async endPasswordReset(
    @Body() endPasswordResetDto: EndPasswordResetDto,
    @Res() res: Response,
  ) {
    const { otp, newPassword } = endPasswordResetDto;
    const response = await this.authService.endPasswordReset(otp, newPassword);
    if ('error' in response) {
      return res
        .status(response.code)
        .json({ message: response.error, code: response.code, data: null });
    } else {
      return res.status(response.code).json({
        message: response.message,
        code: response.code,
        data: response.data,
      });
    }
  }

  @Post('deactivate')
  @UseGuards(JwtAuthGuard) // Assuming only authenticated users can deactivate
  @HttpCode(200)
  async deactivateUser(@Req() req: any, @Res() res: Response) {
    const userObjectId = new Types.ObjectId(req.user.userId); // Convert to MongoDB ObjectId
    const response = await this.authService.deactivateUser(userObjectId);

    if ('error' in response) {
      return res.status(response.code).json({ message: response.error });
    }

    return res.status(response.code).json({ message: response.message });
  }

  @Post('reactivate')
  @UseGuards(JwtAuthGuard) // Assuming only authenticated users can reactivate
  @HttpCode(200)
  async reactivateUser(@Req() req: any, @Res() res: Response) {
    const userObjectId = new Types.ObjectId(req.user.userId); // Convert to MongoDB ObjectId
    const response = await this.authService.reactivateUser(userObjectId);

    if ('error' in response) {
      return res.status(response.code).json({ message: response.error });
    }

    return res.status(response.code).json({ message: response.message });
  }
}
