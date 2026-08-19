import jwt from "jsonwebtoken";
import User from "../models/user.js";
import logger from "../helpers/logger.js";

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies.Authorization;
        if (!token) {
            logger.warn("authentication_failed", {
                requestId: req.requestId,
                reason: "missing_token",
            });
            return res.sendStatus(401);
        }

        const decoded = jwt.verify(token, process.env.SECRET);

        if (Date.now() >= decoded.exp * 1000) {
            logger.warn("authentication_failed", {
                requestId: req.requestId,
                reason: "expired_token",
            });
            return res.sendStatus(401);
        }

        const user = await User.findById(decoded.sub);
        if (!user) {
            logger.warn("authentication_failed", {
                requestId: req.requestId,
                reason: "user_not_found",
            });
            return res.sendStatus(401);
        }

        req.user = user;
        next();
    } catch (error) {
        logger.warn("authentication_failed", {
            requestId: req.requestId,
            reason: "invalid_token",
            error: error.message,
        });
        res.sendStatus(401);
    }
}

export { requireAuth };
