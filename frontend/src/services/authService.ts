import type { User, AuthResult } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { COLLEGE_DOMAIN } from "@/utils/constants";
import { signupSchema, loginSchema, profileSchema } from "@/utils/validation";

/**
 * Auth Service
 * 
 * AWS Mapping:
 * - signup/login → Amazon Cognito User Pools
 * - verifyOTP → Cognito ConfirmSignUp / VerifySoftwareToken
 * - getCurrentUser → Cognito GetUser (access token)
 * - updateProfile → Cognito UpdateUserAttributes + DynamoDB Users table
 */
export const authService = {
  /**
   * Sign up with college email
   * Mock: Creates user in localStorage, returns success
   * Real: Cognito SignUp → sends OTP email
   */
  async signup(email: string, password: string): Promise<AuthResult> {
    // Validate
    const result = signupSchema.safeParse({ email, password, confirmPassword: password });
    if (!result.success) {
      return { user: null, error: (result.error as any).issues?.[0]?.message || (result.error as any).errors?.[0]?.message || result.error.message };
    }

    // Check if user exists
    const existing = storage.getUserByEmail(email);
    if (existing) {
      return { user: null, error: "Account already exists. Please login." };
    }

    // Create unverified user (awaiting OTP)
    const tempUser: User = {
      id: generateId("user"),
      email: email.toLowerCase(),
      name: "",
      branch: "",
      year: 1,
      skills: [],
      availability: "now",
      bio: "",
      rating: 0,
      credits: 10, // Welcome bonus
      trustBadges: [],
      isVerified: false,
      createdAt: nowISO(),
    };

    // Store temp user with a special flag
    const users = storage.getUsers();
    users.push(tempUser);
    storage.saveUsers(users);

    // In real app: await cognito.signUp({ email, password })
    // Mock OTP: 123456
    return { user: tempUser };
  },

  /**
   * Login with email/password
   * Mock: Checks localStorage, returns user if verified
   * Real: Cognito InitiateAuth → returns JWT tokens
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      return { user: null, error: (result.error as any).issues?.[0]?.message || (result.error as any).errors?.[0]?.message || result.error.message };
    }

    const user = storage.getUserByEmail(email);
    if (!user) {
      return { user: null, error: "No account found. Please sign up first." };
    }

    if (!user.isVerified) {
      return { user: null, error: "Please verify your email first (OTP: 123456)." };
    }

    // In real app: await cognito.signIn({ email, password })
    // Store auth token
    storage.setAuthToken(generateId("token"));
    storage.setCurrentUserId(user.id);

    return { user };
  },

  /**
   * Verify OTP code
   * Mock: Accepts 123456, marks user verified
   * Real: Cognito ConfirmSignUp or VerifySoftwareToken
   */
  async verifyOTP(email: string, code: string): Promise<AuthResult> {
    if (code !== "123456") {
      return { user: null, error: "Invalid OTP. Use 123456 for demo." };
    }

    const user = storage.getUserByEmail(email);
    if (!user) {
      return { user: null, error: "User not found. Please sign up first." };
    }

    if (user.isVerified) {
      return { user: null, error: "Already verified. Please login." };
    }

    // Mark as verified - user will complete profile in onboarding
    const updatedUser = { ...user, isVerified: true };
    storage.saveUser(updatedUser);

    storage.setAuthToken(generateId("token"));
    storage.setCurrentUserId(updatedUser.id);

    return { user: updatedUser };
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    storage.clearAuthToken();
    storage.clearCurrentUserId();
  },

  /**
   * Get current user from session
   * Real: Validate JWT, fetch from Cognito/DynamoDB
   */
  async getCurrentUser(): Promise<User | null> {
    const userId = storage.getCurrentUserId();
    if (!userId) return null;
    
    const user = storage.getUserById(userId);
    return user || null;
  },

  /**
   * Complete profile during onboarding
   */
  async completeProfile(userId: string, data: {
    name: string;
    branch: string;
    year: number;
    skills: string[];
    availability: string;
    bio: string;
  }): Promise<AuthResult> {
    const result = profileSchema.safeParse(data);
    if (!result.success) {
      return { user: null, error: (result.error as any).issues?.[0]?.message || (result.error as any).errors?.[0]?.message || result.error.message };
    }

    const user = storage.getUserById(userId);
    if (!user) {
      return { user: null, error: "User not found" };
    }

    const updatedUser: User = {
      ...user,
      ...data,
      availability: data.availability as User["availability"],
    };

    storage.saveUser(updatedUser);
    return { user: updatedUser };
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    const user = storage.getUserById(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...data };
    storage.saveUser(updatedUser);
    return updatedUser;
  },

  /**
   * Resend OTP (mock)
   */
  async resendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    const user = storage.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    // Mock: always succeeds
    return { success: true };
  },
};