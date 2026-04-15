import jwt from "jsonwebtoken";
import { apierror } from "../utils/apierror.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_change_me";

const resolveAccessToken = (req) => {
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken) return cookieToken;

    const authHeader = String(req.headers?.authorization || "");
    if (authHeader.toLowerCase().startsWith("bearer ")) {
        return authHeader.slice(7).trim();
    }

    return "";
};

export const requireAuth = (req, _res, next) => {
    try {
        const token = resolveAccessToken(req);
        if (!token) {
            return next(new apierror(401, "Authentication required"));
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.user = {
            id: String(decoded?.id || ""),
            role: String(decoded?.role || "").toLowerCase(),
            email: String(decoded?.email || "")
        };

        if (!req.user.id || !req.user.role) {
            return next(new apierror(401, "Invalid authentication token"));
        }

        return next();
    } catch (_error) {
        return next(new apierror(401, "Invalid or expired authentication token"));
    }
};

export const requireAdmin = (req, _res, next) => {
    const role = String(req.user?.role || "").toLowerCase();
    if (role !== "admin") {
        return next(new apierror(403, "Admin access is required"));
    }

    return next();
};
