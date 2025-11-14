import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../mongo";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";

const router = Router();

type Comic = {
  _id?: ObjectId;
  title: string;
  author: string;
  year: number;
  publisher?: string;
  status: "pending" | "read";
  userId: ObjectId;
};

const comicsCollection = () => getDb().collection<Comic>("Comics");
const isValidId = (id: string) => ObjectId.isValid(id);

// GET /comics → listar los tebeos del usuario autenticado
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const comics = await comicsCollection().find({ userId }).toArray();
    res.json(comics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo tebeos" });
  }
});

// POST /comics → crear un nuevo tebeo
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    let { title, author, year, publisher, status } = req.body as {
      title?: string;
      author?: string;
      year?: number;
      publisher?: string;
      status?: "pending" | "read";
    };

    if (!title || !author || year === undefined || year === null) {
      return res.status(400).json({
        message: "Los campos title, author y year son obligatorios"
      });
    }

    if (Number.isNaN(year)) {
      return res.status(400).json({ message: "year debe ser un número" });
    }

    if (!status) {
      status = "pending";
    }

    const comicData: Comic = {
      title,
      author,
      year,
      publisher,
      userId: new ObjectId(req.user!.id),
      status
    };

    const result = await comicsCollection().insertOne(comicData);

    return res.status(201).json({
      message: "Tebeo creado correctamente",
      comic: {
        ...comicData,
        _id: result.insertedId
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creando el tebeo" });
  }
});


// PUT /comics/:id → modificar un tebeo existente
router.put("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }

    const { title, author, year, publisher, status } = req.body as {
      title?: string;
      author?: string;
      year?: number;
      publisher?: string;
      status?: "pending" | "read";
    };

    const updates: Partial<Comic> = {};

    if (title !== undefined) updates.title = title;
    if (author !== undefined) updates.author = author;
    if (publisher !== undefined) updates.publisher = publisher;

    if (year !== undefined) {
      const numericYear =
        typeof year === "string" ? Number(year) : (year as number);
      if (Number.isNaN(numericYear)) {
        return res.status(400).json({ message: "year debe ser un número" });
      }
      updates.year = numericYear;
    }

    if (status !== undefined) {
      if (status !== "pending" && status !== "read") {
        return res.status(400).json({ message: "status debe ser 'pending' o 'read'" });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No se ha enviado ningún campo a actualizar" });
    }

    const userId = new ObjectId(req.user!.id);

    const result = await comicsCollection().updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Tebeo no encontrado" });
    }

    const updatedComic = await comicsCollection().findOne({
      _id: new ObjectId(id),
      userId,
    });

    return res.json(updatedComic);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error actualizando el tebeo" });
  }
});


//DELETE /comics/:id → eliminar un tebeo
router.delete("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }

    const userId = new ObjectId(req.user!.id);

    const result = await comicsCollection().deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Tebeo no encontrado" });
    }

    return res.json({ message: "Tebeo eliminado correctamente" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error eliminando el tebeo" });
  }
});

// GET /comics/public → lista pública de tebeos populares
router.get("/public", async (_req, res) => {
  try {
    const comics = await comicsCollection().find({}).toArray();

    return res.json(comics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo tebeos públicos" });
  }
});



export default router;