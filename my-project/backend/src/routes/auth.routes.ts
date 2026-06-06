import bcrypt from "bcryptjs";
import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.middleware.js";

const verifyCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authRouter: ExpressRouter = Router();

authRouter.post(
  "/verify-credentials",
  validate(verifyCredentialsSchema),
  async (req, res) => {
    const { email, password } = verifyCredentialsSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
        role: true,
      },
    });

    if (!user?.password) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      },
    });
  },
);

export default authRouter;
