// routes/auth.ts
import { Router } from "express";
import { connectMongoDB, getDb } from "../mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = Router();

dotenv.config();

const SECRET = process.env.SECRET;

type User = {
    _id?: ObjectId;
    email: string;
    password: string;
}

type JwtPayload = {
    id: string;
    email: string;
}

const coleccion = () => getDb().collection<User>("Users");

router.get("/", async (req, res)=>{
  res.send("Se ha conectado a la ruta de auth correctamente");
});


// POST /auth/register  { username, password }
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "username y password son obligatorios" });
    }

    const users = coleccion();

    const exists = await users.findOne({ email });
    if (exists) return res.status(400).json({ message: "Nombre de usuario ya existe" });

    const passEncripta = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ email, password: passEncripta });

    return res.status(201).json({
      message: "Usuario creado",
      user: { id: result.insertedId.toString(), email},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registrando usuario" });
  }
});

// POST /auth/login  { username, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "username y password son obligatorios" });
    }

    const users = coleccion();

    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign({id: user._id?.toString(), email: user.email} as JwtPayload, SECRET as string, {
            expiresIn: "1h"
        });
    return res.status(200).json({ message: "Login correcto", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en login" });
  }
});



export default router;