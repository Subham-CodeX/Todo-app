import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

export default function VerifyEmail() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const email =
    location.state?.email ||
    "";

  const [
    otp,
    setOtp,
  ] = useState("");

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

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerify =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      if (!email) {
        setError(
          "Email information is missing. Please register again."
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          otp
        )
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
            "/auth/verify-email",
            {
              email,
              otp,
            }
          );

        // ==================================
        // SAVE JWT AFTER VERIFICATION
        // ==================================

        localStorage.setItem(
          "taskflowToken",
          response.data.token
        );

        setSuccess(
          "Email verified successfully!"
        );

        // ==================================
        // PROFILE COMPLETION
        // ==================================

        setTimeout(() => {

          navigate(
            "/profile/complete",
            {
              replace: true,
            }
          );

        }, 700);

      } catch (error) {

        console.error(
          "Verify Email Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Invalid or expired OTP."
        );

      } finally {

        setLoading(false);
      }
    };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend =
    async () => {

      setError("");
      setSuccess("");

      if (!email) {
        setError(
          "Email information is missing."
        );

        return;
      }

      try {

        setResendLoading(true);

        const response =
          await API.post(
            "/auth/resend-email-otp",
            {
              email,
            }
          );

        setSuccess(
          response.data.message
        );

        setOtp("");

      } catch (error) {

        console.error(
          "Resend OTP Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to resend OTP."
        );

      } finally {

        setResendLoading(false);
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "450px",
        }}
      >

        <h1>
          Verify your email
        </h1>

        <p>
          We sent a 6-digit verification
          code to:
        </p>

        <strong>
          {email}
        </strong>

        {error && (
          <div>
            {error}
          </div>
        )}

        {success && (
          <div>
            {success}
          </div>
        )}

        <form
          onSubmit={
            handleVerify
          }
        >

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

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

        <button
          type="button"
          onClick={
            handleResend
          }
          disabled={
            resendLoading
          }
        >
          {resendLoading
            ? "Sending..."
            : "Resend OTP"}
        </button>

      </div>

    </div>
  );
}