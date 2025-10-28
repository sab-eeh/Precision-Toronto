// backend/src/middleware/validateRequest.js
const { validationResult } = require("express-validator");

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: result.array().map((e) => ({
        field: e.param,
        msg: e.msg,
        location: e.location,
      })),
    });
  }
  return next();
};
