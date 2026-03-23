export type UserRole = "interviewer" | "interviewee";

export type SignUpBody = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationName?: string;
};

export type SignUpResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number | null;
  organizationName: string | null;
  createdAt: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number | null;
  createdAt: string;
};