const jwt =
  require(
    "jsonwebtoken"
  );


// ==========================================
// PROTECT ROUTES
// ==========================================

const protect =
  (
    req,
    res,
    next
  ) => {

    try {

      // ======================================
      // GET AUTHORIZATION HEADER
      // ======================================

      const authHeader =
        req.headers.authorization;


      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {

        return res
          .status(
            401
          )
          .json({

            success:
              false,

            message:
              "Authentication required",

          });

      }


      // ======================================
      // GET TOKEN
      // ======================================

      const token =
        authHeader.split(
          " "
        )[1];


      // ======================================
      // VERIFY TOKEN
      // ======================================

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET

        );


      // ======================================
      // ATTACH USER
      // ======================================

      req.user =
        {
          id:
            decoded.id,
        };


      // ======================================
      // CONTINUE
      // ======================================

      next();

    }

    catch (
      error
    ) {

      console.error(
        "Authentication error:",
        error.message
      );


      return res
        .status(
          401
        )
        .json({

          success:
            false,

          message:
            "Invalid or expired token",

        });

    }

  };


// ==========================================
// EXPORT
// ==========================================

module.exports = {

  protect,

};