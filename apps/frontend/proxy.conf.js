const target = process.env.API_PROXY_TARGET || "http://localhost:5000";

module.exports = {
  "/api": {
    target,
    secure: false,
    changeOrigin: true
  },
  "/health": {
    target,
    secure: false,
    changeOrigin: true
  }
};
