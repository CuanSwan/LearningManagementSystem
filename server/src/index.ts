import cors from "cors";
import express from "express";
import { sampleModule } from "./sampleModule.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());

const modules = new Map([[sampleModule.moduleId, sampleModule]]);

app.get("/api/modules/:moduleId", (req, res) => {
  const foundModule = modules.get(req.params.moduleId);
  if (!foundModule) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.json(foundModule);
});

app.listen(port, () => {
  console.log(`LMS API listening on http://localhost:${port}`);
});
