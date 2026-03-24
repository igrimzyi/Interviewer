import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AccountType = "interviewer" | "interviewee";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type OrgForm = {
  organizationName: string;
  organizationSize: string;
  industry: string;
};

type FormErrors = Partial<Record<string, string>>;

const COLORS = {
  black: "#0F172B",
  blue: "#155DFC",
  charcoal: "#45556C",
  lightBorder: "#E2E8F0",
} as const;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>("interviewer");

  const [profile, setProfile] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [org, setOrg] = useState<OrgForm>({
    organizationName: "",
    organizationSize: "",
    industry: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = useMemo(() => {
    if (accountType === "interviewee") {
      return [
        { n: 1, label: "Account Type" as const },
        { n: 2, label: "Profile" as const },
      ];
    }

    return [
      { n: 1, label: "Account Type" as const },
      { n: 2, label: "Profile" as const },
      { n: 3, label: "Organization" as const },
    ];
  }, [accountType]);

  useEffect(() => {
    if (accountType === "interviewee" && step > 2) {
      setStep(2);
    }
  }, [accountType, step]);

  function clearErrors() {
    setErrors({});
    setSubmitError("");
  }

  function validateProfile(): boolean {
    const next: FormErrors = {};

    if (!profile.firstName.trim()) next.firstName = "First name is required.";
    if (!profile.lastName.trim()) next.lastName = "Last name is required.";

    if (!profile.email.trim()) {
      next.email = "Email is required.";
    } else {
      // simple email check; HTML type="email" also helps
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
      if (!ok) next.email = "Enter a valid email.";
    }

    if (!profile.password) {
      next.password = "Password is required.";
    } else if (profile.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }

    if (!profile.confirmPassword) {
      next.confirmPassword = "Confirm your password.";
    } else if (profile.confirmPassword !== profile.password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateOrg(): boolean {
    const next: FormErrors = {};

    if (!org.organizationName.trim()) next.organizationName = "Organization name is required.";
    if (!org.organizationSize.trim()) next.organizationSize = "Organization size is required.";
    if (!org.industry.trim()) next.industry = "Industry is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitRegistration() {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload =
        accountType === "interviewee"
          ? {
              accountType,
              profile: {
                firstName: profile.firstName.trim(),
                lastName: profile.lastName.trim(),
                email: profile.email.trim(),
                password: profile.password,
              },
            }
          : {
              accountType,
              profile: {
                firstName: profile.firstName.trim(),
                lastName: profile.lastName.trim(),
                email: profile.email.trim(),
                password: profile.password,
              },
              organization: {
                name: org.organizationName.trim(),
                size: org.organizationSize.trim(),
                industry: org.industry.trim(),
              },
            };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Registration failed. Please try again.";
        try {
          const data = await res.json();
          if (typeof data?.message === "string") msg = data.message;
        } catch {
          // ignore
        }
        setSubmitError(msg);
        return;
      }

      const data = await res.json();
      signIn(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setSubmitError(err?.message ?? "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function goNext() {
    clearErrors();

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateProfile()) return;

      if (accountType === "interviewee") {
        await submitRegistration();
        return;
      }

      setStep(3);
    }
  }

  function goBack() {
    clearErrors();
    setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));
  }

  async function onComplete(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!validateProfile()) return;
    if (!validateOrg()) return;

    await submitRegistration();
  }

  return (
    <div
      className="min-h-screen w-full px-4 py-10 sm:py-14"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% 0%, rgba(21,93,252,0.10) 0%, rgba(255,255,255,1) 60%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          {/* Simple “robot head” placeholder icon */}
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ border: `1px solid ${COLORS.lightBorder}` }}
            aria-hidden="true"
          >
            <div className="relative h-5 w-6 rounded-md" style={{ border: `2px solid ${COLORS.black}` }}>
              <div
                className="absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
                style={{ border: `2px solid ${COLORS.black}` }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-semibold" style={{ color: COLORS.black }}>
            EnterView
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.charcoal }}>
            Create your account
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6 w-full max-w-[520px]">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const isActive = step === s.n;
              const isDone = step > s.n;

              return (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cx(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                        isActive || isDone ? "text-white" : "text-slate-600"
                      )}
                      style={{
                        backgroundColor: isActive || isDone ? COLORS.blue : "#EAF0FF",
                        border: `1px solid ${isActive || isDone ? COLORS.blue : COLORS.lightBorder}`,
                      }}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {s.n}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.charcoal }}>
                      {s.label}
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className="mx-2 h-[2px] flex-1"
                      style={{
                        backgroundColor: step > s.n ? COLORS.blue : COLORS.lightBorder,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[520px] rounded-2xl bg-white p-5 sm:p-6"
          style={{ border: `1px solid ${COLORS.lightBorder}` }}
        >
          {/* Step content */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.black }}>
                Choose Account Type
              </h2>
              <p className="mt-1 text-sm" style={{ color: COLORS.charcoal }}>
                Select how you'll be using EnterView
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setAccountType("interviewer")}
                 className={cx(
                    "w-full rounded-xl p-4 text-left transition",
                    accountType === "interviewer" ? "ring-2 ring-[#155DFC]" : ""
                 )}
                    style={{
                    border: `1px solid ${accountType === "interviewer" ? COLORS.blue : COLORS.lightBorder}`,
                    backgroundColor: accountType === "interviewer" ? "rgba(21,93,252,0.08)" : "white",
                 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: COLORS.blue }}
                      aria-hidden="true"
                    >
                      {/* simple icon */}
                      <span className="text-sm font-bold">I</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold" style={{ color: COLORS.black }}>
                          Interviewer
                        </div>
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            border: `2px solid ${accountType === "interviewer" ? COLORS.blue : COLORS.lightBorder}`,
                            backgroundColor: accountType === "interviewer" ? COLORS.blue : "transparent",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-1 text-sm" style={{ color: COLORS.charcoal }}>
                        Conduct interviews and evaluate candidates
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("interviewee")}
                 className={cx(
                    "w-full rounded-xl p-4 text-left transition",
                    accountType === "interviewee" ? "ring-2 ring-[#155DFC]" : ""
                 )}
                    style={{
                    border: `1px solid ${accountType === "interviewee" ? COLORS.blue : COLORS.lightBorder}`,
                    backgroundColor: accountType === "interviewee" ? "rgba(21,93,252,0.08)" : "white",
                 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: "#7C3AED" }}
                      aria-hidden="true"
                    >
                      <span className="text-sm font-bold">U</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold" style={{ color: COLORS.black }}>
                          Interviewee
                        </div>
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            border: `2px solid ${accountType === "interviewee" ? COLORS.blue : COLORS.lightBorder}`,
                            backgroundColor: accountType === "interviewee" ? COLORS.blue : "transparent",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-1 text-sm" style={{ color: COLORS.charcoal }}>
                        Join interviews from organizations
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-4 w-full rounded-xl py-3 font-semibold text-white"
                  style={{ backgroundColor: COLORS.black }}
                >
                  Continue
                </button>

                <div className="mt-3 text-center text-sm" style={{ color: COLORS.charcoal }}>
                  Already have an account?{" "}
                  <a href="/login" style={{ color: COLORS.blue, fontWeight: 600 }}>
                    Sign in
                  </a>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await goNext();
              }}
              noValidate
            >
              <h2 className="text-lg font-semibold" style={{ color: COLORS.black }}>
                Your Information
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  name="firstName"
                  value={profile.firstName}
                  onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))}
                  required
                  autoComplete="given-name"
                  error={errors.firstName}
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName}
                  onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))}
                  required
                  autoComplete="family-name"
                  error={errors.lastName}
                />
              </div>

              <div className="mt-4">
                <Field
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  error={errors.email}
                />
              </div>

              <div className="mt-4">
                <Field
                  label="Password"
                  name="password"
                  value={profile.password}
                  onChange={(v) => setProfile((p) => ({ ...p, password: v }))}
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  error={errors.password}
                />
              </div>

              <div className="mt-4">
                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  value={profile.confirmPassword}
                  onChange={(v) => setProfile((p) => ({ ...p, confirmPassword: v }))}
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  error={errors.confirmPassword}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 rounded-xl py-3 font-semibold"
                  style={{ border: `1px solid ${COLORS.lightBorder}`, color: COLORS.black }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl py-3 font-semibold text-white"
                  style={{ backgroundColor: COLORS.black }}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={onComplete} noValidate>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.black }}>
                Organization Details
              </h2>

              <div className="mt-5">
                <Field
                  label="Organization Name"
                  name="organizationName"
                  value={org.organizationName}
                  onChange={(v) => setOrg((o) => ({ ...o, organizationName: v }))}
                  required
                  placeholder="Acme Corp"
                  error={errors.organizationName}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="organizationSize" className="block text-sm font-medium" style={{ color: COLORS.black }}>
                  Organization Size
                </label>
                <select
                  id="organizationSize"
                  name="organizationSize"
                  value={org.organizationSize}
                  onChange={(e) => setOrg((o) => ({ ...o, organizationSize: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-xl px-3 py-3 text-sm outline-none"
                  style={{
                    border: `1px solid ${errors.organizationSize ? "#EF4444" : COLORS.lightBorder}`,
                    backgroundColor: "#F8FAFC",
                    color: org.organizationSize ? COLORS.black : "#9CA3AF",
                  }}
                  aria-invalid={Boolean(errors.organizationSize)}
                  aria-describedby={errors.organizationSize ? "organizationSize-error" : undefined}
                >
                  <option value="" disabled>Select size…</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-500">201–500</option>
                  <option value="501-1000">501–1000</option>
                  <option value="1000+">1000+</option>
                </select>
                {errors.organizationSize && (
                  <div id="organizationSize-error" className="mt-2 text-sm" style={{ color: "#B91C1C" }}>
                    {errors.organizationSize}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Field
                  label="Industry"
                  name="industry"
                  value={org.industry}
                  onChange={(v) => setOrg((o) => ({ ...o, industry: v }))}
                  required
                  placeholder="Technology, Finance, etc."
                  error={errors.industry}
                />
              </div>

              {submitError && (
                <div
                  className="mt-4 rounded-lg p-3 text-sm"
                  style={{ border: `1px solid ${COLORS.lightBorder}`, color: COLORS.black }}
                  role="alert"
                >
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 rounded-xl py-3 font-semibold"
                  style={{ border: `1px solid ${COLORS.lightBorder}`, color: COLORS.black }}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl py-3 font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: COLORS.black }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Complete"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  error?: string;
}) {
  const {
    label,
    name,
    value,
    onChange,
    required,
    type = "text",
    placeholder,
    autoComplete,
    minLength,
    error,
  } = props;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium" style={{ color: COLORS.black }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cx(
          "mt-2 w-full rounded-xl px-3 py-3 text-sm outline-none",
          error ? "ring-2 ring-red-500" : ""
        )}
        style={{
          border: `1px solid ${COLORS.lightBorder}`,
          backgroundColor: "#F8FAFC",
          color: COLORS.black,
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <div id={`${name}-error`} className="mt-2 text-sm" style={{ color: "#B91C1C" }}>
          {error}
        </div>
      )}
    </div>
  );
}