import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { registry } from "./registry.js";

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Plataforma de Activos API",
    version: "1.0.0",
    description:
      "Documentación de API que permite consultar como funcionan los servicios de la plataforma de activos",
  },
});
