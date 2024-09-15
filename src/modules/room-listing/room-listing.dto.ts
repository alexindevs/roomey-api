import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
  Min,
  IsLongitude,
  IsInt,
  ArrayNotEmpty,
  IsLatitude,
} from 'class-validator';
import {
  ApartmentType,
  RoomType,
  RentSchedule,
  Amenities,
  GenderPreference,
} from './room-listing.schema'; // Adjust the path as necessary
import { Transform } from 'class-transformer';

export class CreateRoomListingDto {
  @IsEnum(ApartmentType)
  @IsNotEmpty()
  apartment_type: ApartmentType;

  @IsEnum(RoomType)
  @IsNotEmpty()
  room_type: RoomType;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  images: string[];

  @IsNotEmpty()
  location: {
    geodata: {
      type: string;
      coordinates: number[];
    };
    country: string;
    street_name: string;
    street_number: number;
    city: string;
    province_or_state: string;
    postal_code: string;
  };

  @IsNotEmpty()
  information: {
    num_bedrooms: number;
    num_bathrooms: number;
    num_beds: number;
    description: string;
  };

  @IsNotEmpty()
  show_location: boolean;

  @IsArray()
  @IsEnum(Amenities, { each: true })
  @IsNotEmpty()
  amenities: Amenities[];

  @IsEnum(RentSchedule)
  @IsNotEmpty()
  rent_schedule: RentSchedule;

  @IsNumber()
  @IsNotEmpty()
  rent_amount: number;

  @IsString()
  @IsNotEmpty()
  deadline: string;

  @IsNotEmpty()
  roommate_spec: {
    description: string;
    preferred_gender: GenderPreference;
  };
}

export class UpdateRoomListingDto {
  @IsOptional()
  @IsEnum(ApartmentType)
  apartment_type?: ApartmentType;

  @IsOptional()
  @IsEnum(RoomType)
  room_type?: RoomType;

  @IsOptional()
  location?: {
    coordinates?: [number, number];
    country?: string;
    street_name?: string;
    street_number?: number;
    city?: string;
    province_or_state?: string;
    postal_code?: string;
  };

  @IsOptional()
  information?: {
    num_bedrooms?: number;
    num_bathrooms?: number;
    num_beds?: number;
    description?: string;
  };

  @IsOptional()
  show_location?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(Amenities, { each: true })
  amenities?: Amenities[];

  @IsOptional()
  @IsEnum(RentSchedule)
  rent_schedule?: RentSchedule;

  @IsOptional()
  @IsNumber()
  rent_amount?: number;

  @IsString()
  @IsNotEmpty()
  deadline: string;

  @IsOptional()
  roommate_spec?: {
    description?: string;
    preferred_gender?: GenderPreference;
  };
}

export class SearchRoomListingsDto {
  @IsOptional()
  @IsString()
  searchText?: string;

  @ValidateIf((o) => o.lng !== undefined || o.radius !== undefined)
  @IsLatitude()
  lat?: number;

  @ValidateIf((o) => o.lat !== undefined || o.radius !== undefined)
  @IsLongitude()
  lng?: number;

  @ValidateIf((o) => o.lat !== undefined && o.lng !== undefined)
  @IsNumber()
  @Min(0)
  radius?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(RentSchedule)
  rentSchedule?: RentSchedule;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  bathrooms?: number;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number;
}

// export class FindByUserIdDto {
//   @IsString()
//   @IsNotEmpty()
//   userId: string;
// }
