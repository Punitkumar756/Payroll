const errorHandler = (err, req, res, next) => {

  console.error("=================================");
  console.error("BACKEND ERROR");
  console.error(err);
  console.error("=================================");


  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};


module.exports = errorHandler;