import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  IsDateString,
  IsNumberString,
} from 'class-validator';
import {
  ApartmentType,
  RoomType,
  RentSchedule,
  Amenities,
  GenderPreference,
} from './room-listing.schema'; // Adjust the path as necessary
import { Transform, Type } from 'class-transformer';

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

export class SearchByTextDto {
  @IsString()
  @IsNotEmpty()
  searchText: string;
}

export class SearchByGeolocationDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;

  @IsOptional()
  radius: number;
}

export class SearchByFiltersDto {
  @IsNumberString()
  @IsOptional()
  minPrice?: string;

  @IsNumberString()
  @IsOptional()
  maxPrice?: string;

  @IsEnum(RentSchedule)
  @IsOptional()
  rentSchedule?: RentSchedule;

  @IsNumberString()
  @IsOptional()
  bedrooms?: string;

  @IsNumberString()
  @IsOptional()
  bathrooms?: string;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsArray()
  @IsEnum(Amenities, { each: true })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  amenities?: Amenities[];

  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}

// export class FindByUserIdDto {
//   @IsString()
//   @IsNotEmpty()
//   userId: string;
// }
