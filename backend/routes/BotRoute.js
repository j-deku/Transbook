import express from "express";
import BotChat from "../controllers/BotController.js";
const BotRouter = express.Router();

const validateRequest = (req, res, next) => {
    const { message, language } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid 'message' is required." });
    }
    if (language && typeof language !== "string") {
      return res.status(400).json({ error: "Language must be a string." });
    }
    next();
  };
  

BotRouter.post("/bot", validateRequest, BotChat);

export default BotRouter;