import { useNavigate } from "react-router-dom";

import "../styles/auth.css";

export default function AuthLayout({
  children,
  mode = "login",
}) {
  const navigate = useNavigate();

  const isLogin = mode === "login";

  return (
    <div className="auth-page">

      {/* =====================================
          LEFT IMAGE / HERO
      ===================================== */}

      <section className="auth-visual">

        <div className="auth-visual-overlay" />

        {/* BRAND */}

        <div className="auth-brand">

          <div className="taskflow-logo">
            ✓
          </div>

          <span>
            TaskFlow
          </span>

        </div>


        {/* HERO CONTENT */}

        <div className="auth-hero-content">

          {/* <p className="auth-eyebrow">
            YOUR PERSONAL PRODUCTIVITY SPACE
          </p> */}

          <h6>
            Organize your life.
            <br />
            One task at a time.
          </h6>

          <p className="auth-hero-description">
            Plan your day, manage your tasks,
            save templates, organize your notes
            and stay focused with TaskFlow.
          </p>

        </div>
        <div>
            TASKFLOW
        </div>


        {/* FEATURES */}

        <div className="auth-feature-row">

          <span>
            ✓ Stay organized
          </span>

          <span>
            ✓ Stay focused
          </span>

          <span>
            ✓ Get things done
          </span>

        </div>

      </section>


      {/* =====================================
          RIGHT AUTH AREA
      ===================================== */}

      <section className="auth-form-section">

        <div className="auth-form-container">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="taskflow-logo">
              ✓
            </div>

            <span>
              TaskFlow
            </span>

          </div>


          {/* PAGE CONTENT */}

          {children}


          {/* =================================
              LOGIN / REGISTER SWITCH
          ================================= */}

          <div className="auth-switch">

            {isLogin ? (
              <>
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login
                </button>
              </>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}