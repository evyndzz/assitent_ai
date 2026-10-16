import dotenv from "dotenv";
import path from "path";

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  // Server port
  port: parseInt(process.env.PORT || "3001", 10),

  // Google Gemini API Key
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",

  // Supabase Config
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "",

  // Bot Behavior
  botName: process.env.BOT_NAME || "AssistAI",
  ownerNumber: process.env.OWNER_NUMBER || "", // Opsional: format 628xxx jika hanya ingin merespons nomor tertentu
  allowGroups: process.env.ALLOW_GROUPS === "true",

  // Session storage path for Baileys auth
  authFolder: path.resolve(__dirname, "../auth_info_baileys"),
};

