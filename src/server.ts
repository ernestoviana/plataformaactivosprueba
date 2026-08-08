import express from "express";

const app = express();
const puerto = 3000;

app.use(express.json());

app.listen(puerto, () => {
  console.log("Plataforma de activos corriendo en el puerto " + puerto);
});
