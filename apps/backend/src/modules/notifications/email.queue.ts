export const EMAIL_QUEUE = "email";

export const EmailJob = {
  Welcome: "welcome",
  Login: "login"
} as const;

export interface WelcomeEmailData {
  userId: number;
  email: string;
  name: string;
}
