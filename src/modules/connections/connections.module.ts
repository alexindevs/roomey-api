import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionSchema } from './connections.schema';
import { ConnectionService } from './connections.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connection.name, schema: ConnectionSchema },
    ]),
  ],
  providers: [ConnectionService],
  exports: [ConnectionService], // Export the service so it can be used in other modules
})
export class ConnectionModule {}
