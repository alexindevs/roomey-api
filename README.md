# Roomey

Roomey is an all-in-one platform designed to simplify the process of finding compatible roommates and rental listings. By leveraging personalized algorithms and a robust verification system, Roomey ensures a secure and user-friendly experience. The platform caters to diverse audiences, including students, young professionals, and immigrants, with features tailored to enhance the shared living experience.

---

## Features

### 1. **Room Listings**
   - **Search by Location:** Users can search for rooms based on city, address, or proximity using geolocation.
   - **Filter Options:** Filter by:
     - Price range
     - Number of bedrooms and bathrooms
     - Amenities (e.g Wifi, Parking, Heating)
   - **Listing Details:** Display essential details like rent, move-in date, and room description.
   - **Priority Listings:** Paid options for highlighted listings.

### 2. **Roommate Matching**
   - **Profile Search:** Find potential roommates based on:
     - Lifestyle preferences (e.g., smoking, pets)
     - Interests and hobbies
     - Budget compatibility
   - **Detailed Profiles:** Users can view detailed profiles and initiate connections.

### 3. **Saved Items**
   - **Saved Rooms:** Bookmark interesting room listings.
   - **Saved Roommates:** Keep track of potential roommate profiles.

### 4. **User Management**
   - Secure account creation using email or social media login (Google/Facebook).
   - Two-factor authentication (optional).
   - Account deletion and data anonymization options.

### 5. **Enhanced Search Experience**
   - **Text-Based Search:** Search listings using keywords (e.g., "apartment with balcony").
   - **Geolocation Search:** View nearby listings within a specified radius.
   - **Filter by Move-in Date:** Narrow options by availability timeline.

### 6. **Special Immigrant Features**
   - **Pre-Arrival Verification:** For immigrants, Roomey offers verified room listings to ensure secure options before relocating.
   - **Localized Recommendations:** Curated listings and roommate matches based on the user's origin and destination preferences.

---

## Technical Overview

### **Backend**
- Built with **NestJS** for robust and scalable API development.
- Database management using **MongoDB** with Mongoose for schema definitions.
- Roommate and room listings are managed via RESTful endpoints.

### **Key Functionalities**
- **Search Algorithms:** Advanced text and geospatial search capabilities using MongoDB’s query features.
- **Data Validation:** Ensures data integrity for listings, user profiles, and search queries.
- **Scalability:** Supports thousands of concurrent listings and search queries efficiently.

---

## Project Vision

Roomey aims to revolutionize the roommate and rental experience by addressing common pain points like safety, compatibility, and affordability. With its focus on immigrants and young professionals, the platform is positioned to expand globally, starting with Canada and moving into larger markets like the U.S. and Europe.
