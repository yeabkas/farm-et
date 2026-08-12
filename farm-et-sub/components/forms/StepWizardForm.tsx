"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingFormData } from "@/lib/validations/auth-schema";
import { useRouter } from "next/navigation";
import { CurrencyPicker } from "@/components/ui/CurrencyPicker";
import { GoogleMapView } from "@/components/ui/GoogleMapView";
import { registerUser, submitOnboarding } from "@/lib/services";

export function StepWizardForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    control,
    setValue,
    setError,
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
    if (step === 1) {
      isValid = await trigger(["email", "password", "confirmPassword", "firstName", "lastName", "farmName", "latitude", "longitude"]);
    } else if (step === 2) {
      isValid = await trigger(["unitSystem", "timezone", "currency"]);
    }
    if (isValid) setStep((prev) => (prev + 1) as 2 | 3);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // 1. Register the user (creates account + stores token)
      await registerUser({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      // 2. Submit the farm profile (authenticated via stored token)
      await submitOnboarding(data);
      // 3. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const emailError = err?.response?.data?.errors?.email?.[0];
      if (emailError) {
        // Duplicate email — jump back to Step 1 and show the error on the field
        setStep(1);
        setError("email", { message: emailError });
      } else {
        setSubmitError(err?.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
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
                  placeholder="Min. 6 characters"
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

            {/* GIS Map Viewport Container */}
            <div className="p-2 bg-gray-50/80 border rounded-md text-center space-y-2">
              <p className="text-sm font-medium text-gray-600">Interactive GIS Map Viewport</p>

              {/* 🚀 CHANGED: Added live GoogleMapView canvas while maintaining coordinate input placeholders below */}
              <div className=" w-auto h-auto rounded-md border shadow-xs">
                <GoogleMapView
                  latitude={formData.latitude ?? 0}
                  longitude={formData.longitude ?? 0}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* Preserved Latitude & Longitude Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  {...register("latitude", { valueAsNumber: true })}
                  className="border rounded p-1 text-sm bg-white"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  {...register("longitude", { valueAsNumber: true })}
                  className="border rounded p-1 text-sm bg-white"
                />
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
              <h2 className="text-2xl font-bold text-gray-800">You&apos;re All Set! 🎉</h2>
              <p className="text-gray-600 text-sm">
                Your farm configuration is complete. Review your details before entering the dashboard.
              </p>
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