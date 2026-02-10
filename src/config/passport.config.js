import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";
import bcrypt from "bcrypt";
import userModel from "../dao/models/userModel.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

// Extrae el JWT desde la cookie 
const cookieExtractor = (req) => {
    if (req && req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
    }
    return null;
};

export const configPassport = () => {
    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email" },
            async (username, password, done) => {
                try {
                    const user = await userModel.findOne({ email: username });
                    if (!user) return done(null, false);

                    const isValid = bcrypt.compareSync(password, user.password);
                    if (!isValid) return done(null, false);

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
    passport.use(
        "current",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromExtractors([
                    cookieExtractor,
                    ExtractJWT.fromAuthHeaderAsBearerToken()
                ]),
                secretOrKey: JWT_SECRET
            },
            async (jwt_payload, done) => {
                try {
                    const user = await userModel.findById(jwt_payload.id).select("-password");
                    if (!user) return done(null, false);
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};