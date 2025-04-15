import { NextFunction, Request, Response } from 'express';
import xss from 'xss';

export function xssMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    for (const key in req.body) {
      const body = (req.body[key] = xss(req.body[key]));
    }
  }

  next();
}
