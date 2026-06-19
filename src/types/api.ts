export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export type CurrentUserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    phone: string | null;
    role: string;
    onboardingCompleted: boolean;
    accountStatus: string;
  };
};

export type DashboardStats = {
  user: CurrentUserResponse["user"];
  stats: Record<string, number>;
};
