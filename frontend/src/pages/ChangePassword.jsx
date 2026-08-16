import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  changePassword,
} from "../services/api";

import "../styles/profile.css";

export default function ChangePassword() {

  const navigate =
    useNavigate();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
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

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "New passwords do not match."
        );

        return;
      }

      if (
        newPassword.length < 6
      ) {
        setError(
          "New password must be at least 6 characters."
        );

        return;
      }

      try {

        setLoading(true);

        await changePassword(
          currentPassword,
          newPassword
        );

        setSuccess(
          "Password changed successfully!"
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          navigate(
            "/profile"
          );
        }, 1000);

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
          "Failed to change password."
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="profile-form-page">

      <div className="profile-form-card password-card">

        <div className="profile-form-header">

          <div className="password-icon">
            🔐
          </div>

          <h1>
            Change Password
          </h1>

          <p>
            Keep your TaskFlow account secure.
          </p>

        </div>

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-message success">
            {success}
          </div>
        )}

        <form
          className="profile-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label>
              Current Password
            </label>

            <input
              type="password"
              value={
                currentPassword
              }
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          <div className="form-group">

            <label>
              New Password
            </label>

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
              minLength={6}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Confirm New Password
            </label>

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
              minLength={6}
              required
            />

          </div>

          <button
            type="submit"
            className="save-profile-button"
            disabled={loading}
          >
            {loading
              ? "Changing..."
              : "Change Password"}
          </button>

          <button
            type="button"
            className="cancel-profile-button"
            onClick={() =>
              navigate(
                "/profile"
              )
            }
          >
            Cancel
          </button>

        </form>

      </div>

    </div>
  );
}