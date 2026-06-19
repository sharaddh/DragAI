import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4001", 10),
  maxImageSizeMb: parseInt(process.env.MAX_IMAGE_SIZE_MB || "5", 10),
};
