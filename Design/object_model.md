# Farm-ET Frontend Object Model

```mermaid
classDiagram

    %% ─── Auth & Onboarding Form ────────────────────────────────────────────────

    class OnboardingFormData {
        +string email
        +string password
        +string confirmPassword
        +string firstName
        +string lastName
        +string farmName
        +number latitude
        +number longitude
        +UnitSystem unitSystem
        +string timezone
        +string currency
    }

    class UnitSystem {
        <<enumeration>>
        metric
        imperial
        us_customary
        ethiopian_traditional
        mixed
    }

    class LoginCredentials {
        +string email
        +string password
    }

    class AuthResponse {
        +string message
        +User user
        +string access_token
        +string token_type
    }

    %% ─── Domain Types ───────────────────────────────────────────────────────────

    class User {
        +number id
        +string name
        +string email
        +string role
        +string otp_code
        +string otp_expires_at
        +string email_verified_at
        +string created_at
        +string updated_at
    }

    class AdminUserSummary {
        +number id
        +string name
        +string email
        +string farmName
        +string role
        +number totalTransactions
        +number forSaleCount
        +string createdAt
    }

    class UserDetailPayload {
        +User user
        +Transaction[] recentTransactions
        +Crop[] recentCrops
        +Animal[] recentAnimals
    }

    class FarmProfile {
        +number id
        +number user_id
        +string first_name
        +string last_name
        +string farm_name
        +number latitude
        +number longitude
        +UnitSystem unit_system
        +string timezone
        +string currency
        +string created_at
        +string updated_at
    }

    class Animal {
        +number id
        +number user_id
        +string name
        +string animal_type
        +string breed
        +string sex
        +number age
        +string status
        +string neutered
        +string coloring
        +string description
        +string method_acquired
        +string veterinarian
        +number mature_weight
        +number estimated_value
        +string created_at
        +string updated_at
    }

    class Crop {
        +number id
        +number user_id
        +string crop_type
        +string status
        +string variety_strain
        +string botanical_name
        +string description
        +string internal_id
        +number days_to_maturity
        +boolean is_perennial
        +string harvest_units
        +number sale_window
        +number estimated_value
        +string created_at
        +string updated_at
    }

    class Transaction {
        +number id
        +number user_id
        +TransactionType type
        +number amount
        +string payee_customer
        +string category
        +string date
        +string reporting_year
        +string description
        +string check_number
        +string associated_to
        +string keywords
        +string created_at
        +string updated_at
    }

    class TransactionType {
        <<enumeration>>
        Income
        Expense
    }

    %% ─── API Service Layer ──────────────────────────────────────────────────────

    class AuthService {
        +registerUser(payload) AuthResponse
        +loginUser(credentials) AuthResponse
        +logoutUser() void
        +fetchUserProfile() User
        +verifyEmail(data) void
        +resendOtp() void
    }

    class AdminService {
        +fetchAdminUsers() AdminUserSummary[]
        +fetchAdminUserDetails(id) UserDetailPayload
        +createAdminUser(data) void
        +revokeAdminRole(id) void
        +promoteAdminRole(id) void
    }

    class OnboardingService {
        +submitOnboarding(data) FarmProfile
    }

    class TransactionService {
        +fetchTransactions() Transaction[]
        +createTransaction(data) Transaction
        +fetchFinancialSummary(year) FinancialSummary
    }

    class LivestockService {
        +fetchAnimals() Animal[]
        +createAnimal(data) Animal
    }

    class CropService {
        +fetchCrops() Crop[]
        +createCrop(data) Crop
    }

    %% ─── Validation Schemas (Zod) ───────────────────────────────────────────────

    class onboardingSchema {
        <<ZodSchema>>
        +email: z.string.email
        +password: z.string.min(6)
        +confirmPassword: z.string (refine match)
        +firstName: z.string.min(2)
        +lastName: z.string.min(2)
        +farmName: z.string.min(2)
        +latitude: z.number
        +longitude: z.number
        +unitSystem: z.enum
        +timezone: z.string
        +currency: z.string
    }

    %% ─── Relationships ──────────────────────────────────────────────────────────

    User "1" --> "1" FarmProfile : has one
    User "1" --> "many" Animal    : owns
    User "1" --> "many" Crop      : owns
    User "1" --> "many" Transaction : owns

    OnboardingFormData ..> UnitSystem    : uses
    Transaction        ..> TransactionType : uses

    AuthService        ..> LoginCredentials  : accepts
    AuthService        ..> AuthResponse      : returns
    AuthService        ..> User              : returns
    OnboardingService  ..> FarmProfile       : returns
    TransactionService ..> Transaction       : manages
    LivestockService   ..> Animal            : manages
    CropService        ..> Crop              : manages
    AdminService       ..> AdminUserSummary  : returns
    AdminService       ..> UserDetailPayload : returns

    onboardingSchema ..> OnboardingFormData : infers
```
