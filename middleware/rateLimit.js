const { rateLimit } = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  trustProxy: true,
  handler: function (req, res) {
    res.status(429).json({
      error: "تعداد تلاش‌های ناموفق زیاد است، لطفاً بعداً تلاش کنید",
    });
  },
});
const changePasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  trustProxy: true,
  handler: function (req, res) {
    res.status(429).json({
      error: "تعداد تلاش‌های ناموفق زیاد است، لطفاً بعداً تلاش کنید",
    });
  },
});

module.exports = { authLimiter, changePasswordLimiter };
