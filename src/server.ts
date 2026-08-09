import express from "express";
import "dotenv/config";
import { app } from "./app.js";
const puerto = 3000;

// init script
// deleteAllUsers().then(() => {
//   createUser({
//     outside_id: "user-001",
//     role: "user",
//     status: "active",
//   });
//   createUser({
//     outside_id: "compliance-001",
//     role: "compliance",
//     status: "active",
//   });
// });

app.listen(puerto, () => {
  console.log("Plataforma de activos corriendo en el puerto " + puerto);
  console.log("Para ver la documentación click a http://localhost:3000/docs");
});
