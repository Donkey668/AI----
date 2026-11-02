export type LoginRequestPayload = {
  assistantAccount: string;
  userPassword: string;
};

export type LoginRequestStatus =
  | "success"
  | "invalid_input"
  | "account_not_found"
  | "invalid_password";

export type LoginResponse = {
  requestStatus: LoginRequestStatus;
  message: string;
  assistantAccount: string | null;
};

export type AuthSessionSnapshot = {
  status: "guest" | "authenticated";
  assistantAccount: string | null;
  authenticatedAt: string | null;
};
