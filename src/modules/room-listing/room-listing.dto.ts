import { IsString, IsNotEmpty, IsEnum, IsArray, IsNumber, IsOptional, IsDate } from 'class-validator';
import { ApartmentType, RoomType, RentSchedule, Amenities, GenderPreference } from './room-listing.schema';  // Adjust the path as necessary

export class CreateRoomListingDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(ApartmentType)
  @IsNotEmpty()
  apartment_type: ApartmentType;

  @IsEnum(RoomType)
  @IsNotEmpty()
  room_type: RoomType;

  @IsNotEmpty()
  location: {
    id: string;
    coordinates: [number, number];
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

  @IsDate()
  @IsNotEmpty()
  deadline: Date;

  @IsNotEmpty()
  roommate_spec: {
    description: string;
    preferred_gender: GenderPreference;
  };
}

export class UpdateRoomListingDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsEnum(ApartmentType)
  apartment_type?: ApartmentType;

  @IsOptional()
  @IsEnum(RoomType)
  room_type?: RoomType;

  @IsOptional()
  location?: {
    id?: string;
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

  @IsOptional()
  @IsDate()
  deadline?: Date;

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
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsNumber()
  @IsNotEmpty()
  radius: number;
}

export class SearchByFiltersDto {
  @IsNotEmpty()
  priceRange: {
    min: number;
    max: number;
  };

  @IsNumber()
  @IsNotEmpty()
  bedrooms: number;

  @IsNumber()
  @IsNotEmpty()
  bathrooms: number;

  @IsArray()
  @IsEnum(Amenities, { each: true })
  @IsNotEmpty()
  amenities: Amenities[];

  @IsDate()
  @IsNotEmpty()
  moveInDate: Date;

  @IsOptional()
  @IsString()
  keywords?: string;
}

export class FindByUserIdDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
