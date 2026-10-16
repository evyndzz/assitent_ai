import { initGemini } from "./ai/gemini";
import { initSupabase } from "./db/supabase";
import { initBaileys, getBaileysSocket } from "./bot/baileys";
import { startReminderScheduler } from "./scheduler/reminder-cron";
import { createServer, startServer } from "./server";
import { config } from "./config";

const main = async () => {
  console.log("=================================================");
  console.log(`🤖 Memulai ${config.botName} - AI Personal Assistant`);
  console.log("=================================================");

  // 1. Cek & Inisialisasi Gemini AI
  initGemini();

  // 2. Cek & Inisialisasi Supabase Database
  initSupabase();

  // 3. Jalankan HTTP REST Server
  const app = createServer();
  startServer(app);

  // 4. Jalankan WhatsApp Baileys Socket
  try {
    await initBaileys();
  } catch (err: any) {
    console.error("❌ Gagal memulai WhatsApp Baileys:", err?.message || err);
  }

  // 5. Jalankan Background Scheduler untuk Pengingat (Reminders)
  startReminderScheduler(getBaileysSocket);
};

main().catch((err) => {
  console.error("💥 Fatal Error pada bot:", err);
  process.exit(1);
});

