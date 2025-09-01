// middleware/validateRequest.js
const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(422).json({
    message: "Validation failed",
    errors: errors.array().map((e) => ({ field: e.param, msg: e.msg })),
  });
}

module.exports = validateRequest;
