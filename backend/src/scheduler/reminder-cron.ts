import cron from "node-cron";
import type { WASocket } from "@whiskeysockets/baileys";
import { getAllDueReminders, markReminderCompleted } from "../db/supabase";

let cronJob: cron.ScheduledTask | null = null;

export const startReminderScheduler = (getSocket: () => WASocket | null) => {
  if (cronJob) {
    console.log("ℹ️ [Scheduler] Reminder cron sudah berjalan sebelumnya.");
    return;
  }

  console.log("⏰ [Scheduler] Memulai scheduler pengingat (mengecek setiap 30 detik)...");

  // Jalankan setiap 30 detik: "*/30 * * * * *"
  cronJob = cron.schedule("*/30 * * * * *", async () => {
    try {
      const sock = getSocket();
      if (!sock) return; // Jika WA socket belum tersambung, tunggu siklus berikutnya

      const dueReminders = await getAllDueReminders();
      if (dueReminders.length === 0) return;

      console.log(`🔔 [Scheduler] Ditemukan ${dueReminders.length} pengingat jatuh tempo!`);

      for (const item of dueReminders) {
        try {
          const targetJid = item.user_id;
          const remindDate = new Date(item.remind_at);
          const timeFormatted = remindDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          });
          const dateFormatted = remindDate.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          });

          const notificationText = [
            `⏰ *PENGINGAT PENTING!* ⏰`,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `📌 *Agenda / Pesan:*`,
            `*${item.message}*`,
            ``,
            `🕒 *Jadwal:* ${dateFormatted}, pukul ${timeFormatted} WIB`,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `_Notifikasi otomatis dikirimkan oleh Asisten AI Anda._`,
          ].join("\n");

          await sock.sendMessage(targetJid, { text: notificationText });
          await markReminderCompleted(item.id);
          console.log(`✅ [Scheduler] Pengingat terkirim ke ${targetJid}: "${item.message}"`);
        } catch (err: any) {
          console.error(`❌ [Scheduler] Gagal mengirim reminder ID ${item.id}:`, err?.message || err);
        }
      }
    } catch (err: any) {
      console.error("❌ [Scheduler Error]:", err?.message || err);
    }
  });
};

export const stopReminderScheduler = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("🛑 [Scheduler] Scheduler pengingat dihentikan.");
  }
};

