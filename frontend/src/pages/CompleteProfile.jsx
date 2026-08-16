import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  updateProfile,
  uploadProfileImage,
} from "../services/api";

import "../styles/profile.css";

// =====================================
// AVAILABLE ROLES
// =====================================

const ROLES = [
  "Student",
  "Businessman",
  "Developer",
  "Teacher",
  "Freelancer",
  "Designer",
  "Doctor",
  "Engineer",
  "Entrepreneur",
  "Other",
];

export default function CompleteProfile({
  editMode = false,
}) {

  const navigate = useNavigate();

  const {
    user,
    refreshUser,
  } = useAuth();

  // =====================================
  // FORM STATE
  // =====================================

  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    role: "Student",
    hobbies: "",
    city: "",
    district: "",
    state: "",
    zipCode: "",
    country: "",
    profileImage: "",
  });

  // =====================================
  // IMAGE STATE
  // =====================================

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  // =====================================
  // UI STATE
  // =====================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // =====================================
  // LOAD EXISTING USER
  // =====================================

  useEffect(() => {

    if (!user) return;

    setForm({
      name: user.name || "",
      bio: user.bio || "",
      phone: user.phone || "",
      dateOfBirth:
        user.dateOfBirth || "",
      role:
        user.role || "Other",
      hobbies:
        Array.isArray(user.hobbies)
          ? user.hobbies.join(", ")
          : "",

      city:
        user.address?.city || "",
      district:
        user.address?.district || "",
      state:
        user.address?.state || "",
      zipCode:
        user.address?.zipCode || "",
      country:
        user.address?.country || "",
      profileImage:
        user.profileImage || "",
    });

  }, [user]);

  // =====================================
  // CLEAN IMAGE PREVIEW URL
  // =====================================

  useEffect(() => {

    return () => {

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

    };

  }, [imagePreview]);

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // =====================================
  // PROFILE IMAGE CHANGE
  // =====================================

  const handleImageChange = (e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    // ==================================
    // FILE TYPE
    // ==================================

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image."
      );

      return;
    }

    // ==================================
    // FILE SIZE
    // ==================================

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      setError(
        "Image must be smaller than 2MB."
      );

      return;
    }

    // ==================================
    // STORE FILE
    // ==================================

    setSelectedImage(file);

    // ==================================
    // LOCAL PREVIEW
    // ==================================

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );

  };

  // =====================================
  // SUBMIT PROFILE
  // =====================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    // ==================================
    // REQUIRED NAME
    // ==================================

    if (!form.name.trim()) {

      setError(
        "Name is required."
      );

      return;
    }

    // ==================================
    // REQUIRED PHONE
    // ==================================

    if (!form.phone.trim()) {

      setError(
        "Phone number is required."
      );

      return;
    }

    // ==================================
    // REQUIRED DOB
    // ==================================

    if (!form.dateOfBirth) {

      setError(
        "Date of birth is required."
      );

      return;
    }

    // ==================================
    // REQUIRED ROLE
    // ==================================

    if (!form.role) {

      setError(
        "Please select your role."
      );

      return;
    }

    // ==================================
    // REQUIRED CITY
    // ==================================

    if (!form.city.trim()) {

      setError(
        "City is required."
      );

      return;
    }

    // ==================================
    // REQUIRED DISTRICT
    // ==================================

    if (!form.district.trim()) {

      setError(
        "District is required."
      );

      return;
    }

    // ==================================
    // REQUIRED STATE
    // ==================================

    if (!form.state.trim()) {

      setError(
        "State is required."
      );

      return;
    }

    // ==================================
    // REQUIRED ZIP
    // ==================================

    if (!form.zipCode.trim()) {

      setError(
        "ZIP / PIN code is required."
      );

      return;
    }

    // ==================================
    // REQUIRED COUNTRY
    // ==================================

    if (!form.country.trim()) {

      setError(
        "Country is required."
      );

      return;
    }


    try {

      setLoading(true);

      // ==================================
      // UPDATE PROFILE INFORMATION
      // ==================================

      await updateProfile({

        name:
          form.name.trim(),

        bio:
          form.bio.trim(),

        phone:
          form.phone.trim(),

        dateOfBirth:
          form.dateOfBirth,

        role:
          form.role,

        hobbies:
          form.hobbies
            .split(",")
            .map(
              (hobby) =>
                hobby.trim()
            )
            .filter(Boolean),

        address: {

          city:
            form.city.trim(),

          district:
            form.district.trim(),

          state:
            form.state.trim(),

          zipCode:
            form.zipCode.trim(),

          country:
            form.country.trim(),

        },

      });

      // ==================================
      // UPLOAD PROFILE IMAGE
      // ==================================

      if (selectedImage) {

        await uploadProfileImage(
          selectedImage
        );

      }

      // ==================================
      // REFRESH AUTH USER
      // ==================================

      await refreshUser();

      // ==================================
      // SUCCESS
      // ==================================

      setSuccess(
        selectedImage
          ? "Profile and profile photo saved successfully!"
          : "Profile saved successfully!"
      );
      // Clear selected file

      setSelectedImage(null);

      setImagePreview("");

      // ==================================
      // REDIRECT AFTER NEW PROFILE
      // ==================================

      if (!editMode) {

        setTimeout(() => {

          navigate("/");

        }, 700);

      }

    } catch (error) {

      console.error(
        "Profile Save Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to save profile."
      );

    } finally {

      setLoading(false);

    }

  };

  // =====================================
  // AVATAR
  // =====================================

  const avatar =
    imagePreview ||
    form.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      form.name || "User"
    )}&background=7B2FF7&color=fff&size=200`;

  // =====================================
  // UI
  // =====================================

  return (

    <div className="profile-form-page">

      <div className="profile-form-card">


        {/* =========================
            TITLE
        ========================= */}

        <div className="profile-form-header">

          <h1>

            {editMode
              ? "Edit Profile"
              : "Complete Profile"}

          </h1>

          <p>
            Tell us a little about yourself
          </p>

        </div>


        {/* =========================
            PROFILE PHOTO
        ========================= */}

        <div className="profile-photo-section">

          <img
            src={avatar}
            alt="Profile"
            className="profile-form-avatar"
          />


          <label className="photo-button">

            📷{" "}

            {selectedImage ||
            form.profileImage
              ? "Change Photo"
              : "Add Photo"}


            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              hidden
            />

          </label>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="profile-message error">

            {error}

          </div>

        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {success && (

          <div className="profile-message success">

            {success}

          </div>

        )}


        {/* =========================
            FORM
        ========================= */}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >


          {/* =========================
              NAME
          ========================= */}

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Your name"
              required
            />

          </div>


          {/* =========================
              EMAIL
          ========================= */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              value={
                user?.email || ""
              }
              disabled
            />

            <small>
              Email cannot be changed here.
            </small>

          </div>


          {/* =========================
              BIO
          ========================= */}

          <div className="form-group">

            <label>
              Bio
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={
                handleChange
              }
              placeholder="Tell us about yourself..."
              rows="3"
            />

          </div>


          {/* =========================
              PHONE
          ========================= */}

          <div className="form-group">

            <label>
              Phone
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={
                handleChange
              }
              placeholder="9876543210"
              inputMode="tel"
            />

          </div>


          {/* =========================
              DATE OF BIRTH
          ========================= */}

          <div className="form-group">

            <label>
              Date of Birth
            </label>

            <input
              type="date"
              name="dateOfBirth"
              value={
                form.dateOfBirth
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* =========================
              ROLE
          ========================= */}

          <div className="form-group">

            <label>
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={
                handleChange
              }
            >

              {ROLES.map(
                (role) => (

                  <option
                    key={role}
                    value={role}
                  >

                    {role}

                  </option>

                )
              )}

            </select>

          </div>


          {/* =========================
              HOBBIES
          ========================= */}

          <div className="form-group">

            <label>
              Hobbies
            </label>

            <input
              name="hobbies"
              value={
                form.hobbies
              }
              onChange={
                handleChange
              }
              placeholder="Coding, Music, Gaming"
            />

            <small>
              Separate hobbies with commas.
            </small>

          </div>


          {/* =========================
              ADDRESS
          ========================= */}

          <div className="address-title">
            Address
          </div>


          {/* CITY */}

          <div className="form-group">

            <label>
              City
            </label>

            <input
              name="city"
              value={form.city}
              onChange={
                handleChange
              }
              placeholder="Kolkata"
            />

          </div>


          {/* DISTRICT */}

          <div className="form-group">

            <label>
              District
            </label>

            <input
              name="district"
              value={
                form.district
              }
              onChange={
                handleChange
              }
              placeholder="North 24 Parganas"
            />

          </div>


          {/* STATE */}

          <div className="form-group">

            <label>
              State
            </label>

            <input
              name="state"
              value={form.state}
              onChange={
                handleChange
              }
              placeholder="West Bengal"
            />

          </div>


          {/* ZIP / PIN */}

          <div className="form-group">

            <label>
              ZIP / PIN
            </label>

            <input
              name="zipCode"
              value={
                form.zipCode
              }
              onChange={
                handleChange
              }
              placeholder="700001"
              inputMode="numeric"
            />

          </div>


          {/* COUNTRY */}

          <div className="form-group">

            <label>
              Country
            </label>

            <input
              name="country"
              value={
                form.country
              }
              onChange={
                handleChange
              }
              placeholder="India"
            />

          </div>


          {/* =========================
              SAVE
          ========================= */}

          <button
            type="submit"
            className="save-profile-button"
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : "Save Profile"}

          </button>


          {/* =========================
              CANCEL
          ========================= */}

          {editMode && (

            <button
              type="button"
              className="cancel-profile-button"
              onClick={() =>
                navigate("/profile")
              }
              disabled={loading}
            >

              Cancel

            </button>

          )}

        </form>

      </div>

    </div>

  );

}