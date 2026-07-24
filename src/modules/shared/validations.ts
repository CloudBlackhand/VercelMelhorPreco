import { z } from "zod";

export const CEPSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use o formato 12345-678 ou 12345678")
  .transform((val) => val.replace(/-/g, ""));

// dentro dos limites do Brasil
export const CoordinateSchema = z.object({
  lat: z.number().min(-35).max(5).refine((val) => !isNaN(val), "Latitude inválida"),
  lng: z.number().min(-75).max(-30).refine((val) => !isNaN(val), "Longitude inválida"),
});

export const KMLFileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, "Arquivo muito grande (máximo 10MB)"),
  type: z.string().refine((val) => val === "application/vnd.google-earth.kml+xml" || val === "application/xml" || val.endsWith(".kml"), "Arquivo deve ser KML"),
});


