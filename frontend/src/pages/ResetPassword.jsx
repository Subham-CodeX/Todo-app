import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

import API from "../services/api";

import AuthLayout from "../components/AuthLayout";

export default function ResetPassword() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const email =
    location.state?.email || "";

  // ==========================================
  // STEP
  // ==========================================

  const [
    step,
    setStep,
  ] = useState(1);

  // ==========================================
  // FORM
  // ==========================================

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    resetToken,
    setResetToken,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  // ==========================================
  // UI
  // ==========================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================
  // RESEND COOLDOWN
  // ==========================================

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

  // ==========================================
  // RESEND COUNTDOWN
  // ==========================================

  useEffect(() => {

    if (resendCooldown <= 0) {
      return;
    }

    const timer =
      setInterval(() => {

        setResendCooldown(
          (prev) => {

            if (prev <= 1) {

              clearInterval(timer);

              return 0;
            }

            return prev - 1;
          }
        );

      }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [resendCooldown]);

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      // ======================================
      // VALIDATE OTP
      // ======================================

      if (
        !/^\d{6}$/.test(otp)
      ) {

        setError(
          "Please enter the 6-digit OTP."
        );

        return;
      }

      try {

        setLoading(true);

        const response =
          await API.post(
            "/auth/verify-reset-otp",
            {
              email,
              otp,
            }
          );

        const token =
          response.data.resetToken;

        // ====================================
        // CHECK RESET TOKEN
        // ====================================

        if (!token) {

          setError(
            "Reset token was not received. Please try again."
          );

          return;
        }

        // ====================================
        // STORE TEMPORARY TOKEN IN MEMORY
        // ====================================

        setResetToken(token);

        // ====================================
        // MOVE TO PASSWORD STEP
        // ====================================

        setStep(2);

        setSuccess(
          "OTP verified successfully."
        );

      } catch (error) {

        console.error(
          "Verify OTP Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to verify OTP."
        );

      } finally {

        setLoading(false);

      }
    };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOTP =
    async () => {

      // ======================================
      // PREVENT MULTIPLE REQUESTS
      // ======================================

      if (
        resendCooldown > 0 ||
        loading
      ) {

        return;
      }

      setError("");
      setSuccess("");

      try {

        setLoading(true);

        const response =
          await API.post(
            "/auth/resend-reset-otp",
            {
              email,
            }
          );

        // ====================================
        // CLEAR OLD OTP
        // ====================================

        setOtp("");

        // ====================================
        // RESET SUCCESS MESSAGE
        // ====================================

        setSuccess(
          "A new OTP has been sent to your email."
        );

        // ====================================
        // START COOLDOWN
        // ====================================

        const retryAfter =
          Number(
            response.data.retryAfter
          ) || 60;

        setResendCooldown(
          retryAfter
        );

      } catch (error) {

        console.error(
          "Resend OTP Error:",
          error
        );

        // ====================================
        // BACKEND RATE LIMIT
        // ====================================

        const retryAfter =
          Number(
            error.response?.data?.retryAfter
          );

        if (
          retryAfter &&
          retryAfter > 0
        ) {

          setResendCooldown(
            retryAfter
          );
        }

        setError(
          error.response?.data?.message ||
          "Failed to resend OTP."
        );

      } finally {

        setLoading(false);

      }
    };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      // ======================================
      // PASSWORD LENGTH
      // ======================================

      if (
        newPassword.length < 6
      ) {

        setError(
          "Password must be at least 6 characters."
        );

        return;
      }

      // ======================================
      // CONFIRM PASSWORD
      // ======================================

      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;
      }

      // ======================================
      // RESET TOKEN CHECK
      // ======================================

      if (!resetToken) {

        setError(
          "Reset session is invalid. Please start again."
        );

        return;
      }

      try {

        setLoading(true);

        await API.post(
          "/auth/reset-password",
          {
            email,

            resetToken,

            newPassword,
          }
        );

        // ====================================
        // DELETE TOKEN FROM MEMORY
        // ====================================

        setResetToken("");

        // ====================================
        // CLEAR PASSWORD FIELDS
        // ====================================

        setNewPassword("");

        setConfirmPassword("");

        setSuccess(
          "Password reset successfully! Redirecting to login..."
        );

        // ====================================
        // REDIRECT TO LOGIN
        // ====================================

        setTimeout(() => {

          navigate(
            "/login",
            {
              replace: true,
            }
          );

        }, 1500);

      } catch (error) {

        console.error(
          "Reset Password Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to reset password."
        );

      } finally {

        setLoading(false);

      }
    };

  // ==========================================
  // NO EMAIL
  // ==========================================

  if (!email) {

    return (

      <AuthLayout mode="login">

        <div className="auth-heading">

          <h2>
            Password reset
          </h2>

          <p>
            Please start the password
            recovery process again.
          </p>

        </div>

        <button
          className="auth-submit"
          onClick={() =>
            navigate(
              "/forgot-password"
            )
          }
        >
          Go to Forgot Password
        </button>

      </AuthLayout>
    );
  }

  // ==========================================
  // STEP 1 — VERIFY OTP
  // ==========================================

  if (step === 1) {

    return (

      <AuthLayout mode="login">

        <div className="auth-heading">

          <p className="auth-heading-label">
            VERIFY OTP
          </p>

          <h2>
            Verify your email 🔐
          </h2>

          <p>
            Enter the OTP sent to:
          </p>

          <strong>
            {email}
          </strong>

        </div>

        {/* ==================================
            ERROR MESSAGE
        ================================== */}

        {error && (

          <div className="auth-error">

            <span>
              !
            </span>

            {error}

          </div>
        )}

        {/* ==================================
            SUCCESS MESSAGE
        ================================== */}

        {success && (

          <div className="auth-success">

            {success}

          </div>
        )}

        {/* ==================================
            OTP FORM
        ================================== */}

        <form
          className="auth-form"
          onSubmit={handleVerifyOTP}
        >

          <div className="auth-field">

            <label>
              Verification OTP
            </label>

            <div className="auth-input-wrapper">

              <span>
                #
              </span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                  )
                }
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
              />

            </div>

          </div>

          {/* ==================================
              VERIFY BUTTON
          ================================== */}

          <button
            type="submit"
            className="auth-submit"
            disabled={
              loading ||
              otp.length !== 6
            }
          >

            <span>

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </span>

            {!loading && (
              <FaArrowRight />
            )}

          </button>

        </form>

        {/* ==================================
            RESEND OTP
        ================================== */}

        <button
          type="button"
          className="forgot-password"
          onClick={
            handleResendOTP
          }
          disabled={
            resendCooldown > 0 ||
            loading
          }
        >

          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Resend OTP"}

        </button>

      </AuthLayout>
    );
  }

  // ==========================================
  // STEP 2 — NEW PASSWORD
  // ==========================================

  return (

    <AuthLayout mode="login">

      <div className="auth-heading">

        <p className="auth-heading-label">
          NEW PASSWORD
        </p>

        <h2>
          Create a new password 🔐
        </h2>

        <p>
          Your OTP has been verified.
          Create a new password for your account.
        </p>

      </div>

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div className="auth-error">

          <span>
            !
          </span>

          {error}

        </div>
      )}

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (

        <div className="auth-success">

          {success}

        </div>
      )}

      {/* ======================================
          RESET PASSWORD FORM
      ====================================== */}

      <form
        className="auth-form"
        onSubmit={
          handleResetPassword
        }
      >

        {/* ====================================
            NEW PASSWORD
        ==================================== */}

        <div className="auth-field">

          <label>
            New Password
          </label>

          <div className="auth-input-wrapper">

            <FaLock />

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

          </div>

        </div>

        {/* ====================================
            CONFIRM PASSWORD
        ==================================== */}

        <div className="auth-field">

          <label>
            Confirm Password
          </label>

          <div className="auth-input-wrapper">

            <FaLock />

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
            />

          </div>

        </div>

        {/* ====================================
            RESET BUTTON
        ==================================== */}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >

          <span>

            {loading
              ? "Resetting..."
              : "Set New Password"}

          </span>

          {!loading && (
            <FaArrowRight />
          )}

        </button>

      </form>

    </AuthLayout>
  );
}