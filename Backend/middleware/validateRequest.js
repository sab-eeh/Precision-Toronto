const { validationResult } = require("express-validator");

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: result.array(),
    });
  }
  next();
};
