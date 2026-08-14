"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingFormData } from "@/lib/validations/auth-schema";
import { useRouter } from "next/navigation";
import { CurrencyPicker } from "@/components/ui/CurrencyPicker";
import { LocationSearchMap } from "@/components/ui/LocationSearchMap";
import { registerUser, submitOnboarding, verifyEmailOtp, resendVerificationOtp } from "@/lib/services";

export function StepWizardForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    control,
    setValue,
    setError,
    getValues,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      unitSystem: "metric",
      timezone: "UTC",
      currency: "USD",
      latitude: 0,
      longitude: 0,
    },
  });

  // 🚀 CHANGED: Watching current form data to sync map coordinates and render Step 3 summary card
  const formData = useWatch({ control }) ?? {
    firstName: "",
    lastName: "",
    farmName: "",
    latitude: 0,
    longitude: 0,
    unitSystem: "metric",
    timezone: "UTC",
    currency: "USD",
  };

  // 🚀 CHANGED: Helper function to sync selected map coordinates back into React Hook Form
  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("latitude", parseFloat(lat.toFixed(6)), { shouldValidate: true });
    setValue("longitude", parseFloat(lng.toFixed(6)), { shouldValidate: true });
  };

  const handleNextStep = async () => {
    let isValid = false;
    setSubmitError(null);
    if (step === 1) {
      isValid = await trigger(["email", "password", "confirmPassword", "firstName", "lastName", "farmName", "latitude", "longitude"]);
    } else if (step === 2) {
      isValid = await trigger(["unitSystem", "timezone", "currency"]);
      if (isValid && !isRegistered) {
        setSubmitting(true);
        try {
          const formDataValues = getValues();
          await registerUser({
            name: `${formDataValues.firstName} ${formDataValues.lastName}`,
            email: formDataValues.email,
            password: formDataValues.password,
            password_confirmation: formDataValues.confirmPassword,
          });
          setIsRegistered(true);
          setStep(3);
        } catch (error) {
          const err = error as { response?: { data?: { message?: string; errors?: { email?: string[] } } } };
          const emailError = err?.response?.data?.errors?.email?.[0];
          if (emailError) {
            setStep(1);
            setError("email", { message: emailError });
          } else {
            setSubmitError(err?.response?.data?.message || "Registration failed. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
        return;
      }
    }
    if (isValid) setStep((prev) => (prev + 1) as 2 | 3);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (!otp || otp.length !== 6) {
        setSubmitError("Please enter a valid 6-digit verification code.");
        setSubmitting(false);
        return;
      }
      // 1. Verify the OTP
      await verifyEmailOtp(otp);
      
      // 2. Submit the farm profile (authenticated via stored token)
      await submitOnboarding(data);
      
      // 3. Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setSubmitError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setSubmitError(null);
    try {
      await resendVerificationOtp();
      alert("Verification code resent successfully!");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setSubmitError(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6 font-mono bg-linear-to-br from-[#d49e1720] via-[#83c80b1c] to-[#10b9812a] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)]-md">
      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {/* Step 1 */} 
        <div className={`flex items-center gap-1.5 font-semibold ${step === 1 ? "text-green-600" : "text-gray-400"}`}>
          <span>1</span>
          <span className={step === 1 ? "inline" : "hidden sm:inline"}>
            . About Your Farm
          </span>
        </div>

        {/* Step 2 */}
        <div className={`flex items-center gap-1.5 font-semibold ${step === 2 ? "text-green-600" : "text-gray-400"}`}>
          <span>2</span>
          <span className={step === 2 ? "inline" : "hidden sm:inline"}>
            . Preferences
          </span>
        </div>

        {/* Step 3 */}
        <div className={`flex items-center gap-1.5 font-semibold ${step === 3 ? "text-green-600" : "text-gray-400"}`}>
          <span>3</span>
          <span className={step === 3 ? "inline" : "hidden sm:inline"}>
            . Complete
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Farm Information & GIS Spatial Viewport */}
        {step === 1 && (
          <div className="space-y-2 p-1">
            <h2 className="text-xl font-bold text-gray-800">Create your account</h2>

            {/* ── Account Credentials ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded-md p-2 mt-1 bg-white/70 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 symbol"
                  className="w-full border rounded-md p-2 mt-1 bg-white/70 text-sm"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Repeat password"
                  className="w-full border rounded-md p-2 mt-1 bg-white/70 text-sm"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Real-time Password Requirements Checklist */}
            <div className="bg-white/60 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
              <p className="font-semibold text-gray-700 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <p className={formData.password && formData.password.length >= 8 ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                  {formData.password && formData.password.length >= 8 ? "✓" : "•"} At least 8 characters
                </p>
                <p className={formData.password && /[A-Z]/.test(formData.password) ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                  {formData.password && /[A-Z]/.test(formData.password) ? "✓" : "•"} 1 Uppercase letter (A-Z)
                </p>
                <p className={formData.password && /[0-9]/.test(formData.password) ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                  {formData.password && /[0-9]/.test(formData.password) ? "✓" : "•"} 1 Number (0-9)
                </p>
                <p className={formData.password && /[^A-Za-z0-9]/.test(formData.password) ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                  {formData.password && /[^A-Za-z0-9]/.test(formData.password) ? "✓" : "•"} 1 Special symbol (@#$%)
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Tell us about your farm</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input {...register("firstName")} className="w-full border rounded-md p-2 mt-1 bg-white/70" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input {...register("lastName")} className="w-full border rounded-md p-2 mt-1 bg-white/70" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Farm Name</label>
              <input {...register("farmName")} className="w-full border rounded-md p-2 mt-1 bg-white/70" />
              {errors.farmName && <p className="text-red-500 text-xs mt-1">{errors.farmName.message}</p>}
            </div>

            {/* GIS Location Search & Map Container */}
            <div className="p-3 bg-gray-50/90 border border-gray-200 rounded-lg space-y-3">
              <LocationSearchMap
                latitude={formData.latitude ?? 0}
                longitude={formData.longitude ?? 0}
                onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng)}
              />

              {/* Preserved Latitude & Longitude Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    {...register("latitude", { valueAsNumber: true })}
                    className="w-full border rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    {...register("longitude", { valueAsNumber: true })}
                    className="w-full border rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Farm Preferences */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Farm Preferences</h2>
            <div>
  <label className="block text-sm font-medium text-gray-700">Measurement System</label>
  <select {...register("unitSystem")} className="w-full border rounded-md p-2 mt-1 bg-white/70">
    <option value="metric">Metric (kg, hectares, liters)</option>
    <option value="imperial">Imperial (lbs, UK acres, UK gallons)</option>
    <option value="us_customary">US Customary (lbs, US acres, US bushels)</option>
    <option value="ethiopian_traditional">Ethiopian Traditional (Kadam, Timad, Gasha, Quintal)</option>
    <option value="mixed">Mixed / Custom (Configure per module)</option>
  </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
<div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Currency
    </label>
    <CurrencyPicker
      value={formData.currency ?? "USD"}
      onChange={(val) => setValue("currency", val, { shouldValidate: true })}
    />
    {errors.currency && (
      <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>
    )}
  </div>
            </div>

          </div>
        )}

        {/* STEP 3: Configured Setup Confirmation with Dynamic Review Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Verify Your Email 📩</h2>
              <p className="text-gray-600 text-sm">
                We&apos;ve sent a 6-digit verification code to <span className="font-semibold">{formData.email}</span>. Please enter it below to complete setup.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 pt-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-48 text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-md p-3 bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-sm text-green-600 hover:text-green-700 font-medium underline"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </div>

            {/* 🚀 CHANGED: Configured Step 3 to dynamically display a summary card of user inputs from Steps 1 & 2 */}
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-lg border border-gray-200 shadow-xs space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Owner Name:</span>
                <span className="font-semibold text-gray-800">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Farm Name:</span>
                <span className="font-semibold text-gray-800">{formData.farmName}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Location (Lat, Long):</span>
                <span className="font-semibold text-gray-800">
                  {formData.latitude}, {formData.longitude}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Measurement System:</span>
                <span className="font-semibold text-gray-800 capitalize">{formData.unitSystem}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Timezone / Currency:</span>
                <span className="font-semibold text-gray-800">
                  {formData.timezone} / {formData.currency}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2">
          {submitError && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
                className="px-4 py-2 bg-[#f3f4f644] text-gray-700 rounded-md font-medium hover:bg-gray-200/50 transition"
              >
                Previous
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition shadow-md disabled:opacity-60"
              >
                {submitting ? "Setting up…" : "Finish Setup"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}