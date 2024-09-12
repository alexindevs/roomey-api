import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApartmentType {
  Apartment = 'Apartment',
  House = 'House',
  Cabin = 'Cabin',
}

export enum RoomType {
  Shared_Room = 'Shared_Room',
  Single_Room = 'Single_Room',
  Apartment = 'Apartment',
}

export enum RentSchedule {
  Month = 'Month',
  Year = 'Year',
  Week = 'Week',
}

export enum Amenities {
  Wifi = 'Wifi',
  Pool = 'Pool',
  Hot_Tub = 'Hot_Tub',
  Air_Conditioning = 'Air_Conditioning',
  Washing_Machine = 'Washing_Machine',
  Dedicated_Workspace = 'Dedicated_Workspace',
  Freezer = 'Freezer',
  Free_Parking = 'Free_Parking',
  TV = 'TV',
  Gym = 'Gym',
  Kitchen = 'Kitchen',
  Heating = 'Heating',
  Dryer = 'Dryer',
  Dishwasher = 'Dishwasher',
  Refrigerator = 'Refrigerator',
  Microwave = 'Microwave',
  Oven = 'Oven',
  Coffee_Maker = 'Coffee_Maker',
  Balcony = 'Balcony',
  Garden = 'Garden',
  Patio = 'Patio',
  Elevator = 'Elevator',
  Fireplace = 'Fireplace',
  Breakfast = 'Breakfast',
}

export enum GenderPreference {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  None = 'None',
}

class RoomInfo {
  @Prop({ required: true, type: Number })
  num_bedrooms: number;

  @Prop({ required: true, type: Number })
  num_bathrooms: number;

  @Prop({ required: true, type: Number })
  num_beds: number;

  @Prop({ required: true, type: String })
  description: string;
}

export class Location {
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    // format: lng, lat
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  geodata: {
    type: string;
    coordinates: number[];
  };

  @Prop({ required: true, type: String })
  country: string;

  @Prop({ required: true, type: String })
  street_name: string;

  @Prop({ required: true, type: Number })
  street_number: number;

  @Prop({ required: true, type: String })
  city: string;

  @Prop({ required: true, type: String })
  province_or_state: string;

  @Prop({ required: true, type: String })
  postal_code: string;
}

class RoommateSpec {
  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, enum: GenderPreference, type: String })
  preferred_gender: GenderPreference;
}

export type RoomListingDocument = RoomListing & Document;

@Schema()
export class RoomListing {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: string;

  @Prop({ required: true, enum: ApartmentType, type: String })
  apartment_type: ApartmentType;

  @Prop({ required: true, enum: RoomType, type: String })
  room_type: RoomType;

  @Prop({ required: true, type: Location })
  location: Location;

  @Prop({ required: true, type: RoomInfo })
  information: RoomInfo;

  @Prop({ required: true, type: Boolean })
  show_location: boolean;

  @Prop({ required: true, enum: Amenities, type: [String] })
  amenities: Amenities[];

  @Prop({ required: true, enum: RentSchedule, type: String })
  rent_schedule: RentSchedule;

  @Prop({ required: true, default: true, type: Boolean })
  is_active: boolean;

  @Prop({ required: true, type: Array, minlength: 1, maxlength: 8 })
  images: string[];

  @Prop({ required: true, type: Number })
  rent_amount: number;

  @Prop({ required: true, type: Date })
  deadline: Date;

  @Prop({ required: true, type: RoommateSpec })
  roommate_spec: RoommateSpec;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const RoomListingSchema = SchemaFactory.createForClass(RoomListing);

export type SavedRoomsDocument = SavedRooms & Document;

@Schema()
export class SavedRooms {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: string;

  @Prop({ type: Types.ObjectId, ref: 'RoomListing' })
  room_id: string;
}

export const SavedRoomsSchema = SchemaFactory.createForClass(SavedRooms);
