import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export const WS_GUARDS_METADATA = 'ws_guards';

export function UseWsGuards(...guards: any[]) {
  return applyDecorators(
    SetMetadata(WS_GUARDS_METADATA, guards),
    UseGuards(
      ...guards.map(
        (guard) =>
          new (class extends guard {
            canActivate(context: any) {
              try {
                return super.canActivate(context);
              } catch (error) {
                if (error instanceof WsException) {
                  throw error;
                }
                throw new WsException(error.message);
              }
            }
          })(),
      ),
    ),
  );
}
