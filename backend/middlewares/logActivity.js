import ActivityLog from "../models/ActivityLog";

const logActivity = async (req, res, next) => {
  try {
    await new ActivityLog({ adminEmail: req.admin.email, action: req.originalUrl }).save();
    next();
  } catch (error) {
    console.error("Logging failed", error);
    next();
  }
};

export default logActivity;
