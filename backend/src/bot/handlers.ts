import type { WASocket, proto } from "@whiskeysockets/baileys";
import { parseMessageWithGemini } from "../ai/gemini";
import {
  addFinanceRecord,
  getFinancesSummary,
  getRecentFinances,
  addReminder,
  getPendingReminders,
  addNote,
  getNotes,
} from "../db/supabase";
import { config } from "../config";

// Format nominal rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const handleIncomingMessage = async (sock: WASocket, msg: proto.IWebMessageInfo) => {
  try {
    const key = msg.key;
    if (!key || !key.remoteJid) return;

    const jid = key.remoteJid;

    // Abaikan jika dari status broadcast
    if (jid === "status@broadcast") return;

    // Abaikan group chat jika allowGroups = false
    const isGroup = jid.endsWith("@g.us");
    if (isGroup && !config.allowGroups) return;

    // Ekstrak teks pesan
    const messageContent = msg.message;
    if (!messageContent) return;

    const text =
      messageContent.conversation ||
      messageContent.extendedTextMessage?.text ||
      messageContent.imageMessage?.caption ||
      "";

    if (!text || text.trim() === "") return;

    console.log(`📩 [Pesan Masuk] Dari: ${jid} | Isi: "${text}"`);

    // Tampilkan status "sedang mengetik..." di WhatsApp
    await sock.sendPresenceUpdate("composing", jid);

    // 1. Ekstraksi intent menggunakan Gemini AI
    const parsed = await parseMessageWithGemini(text, jid);
    console.log(`🧠 [Gemini Intent]:`, parsed.intent, parsed.data);

    let replyMessage = parsed.reply;

    // 2. Eksekusi aksi berdasarkan intent
    switch (parsed.intent) {
      case "FINANCE": {
        if (parsed.data?.amount && parsed.data?.type) {
          try {
            await addFinanceRecord({
              user_id: jid,
              type: parsed.data.type,
              amount: parsed.data.amount,
              category: parsed.data.category || "Lainnya",
              payment_method: parsed.data.payment_method || "Cash",
              note: parsed.data.note || text,
            });

            const emoji = parsed.data.type === "income" ? "🟢" : "🔴";
            const tipeText = parsed.data.type === "income" ? "Pemasukan" : "Pengeluaran";

            replyMessage = [
              `✅ *Catatan Keuangan Tersimpan!*`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `${emoji} *Jenis:* ${tipeText}`,
              `💰 *Nominal:* ${formatRupiah(parsed.data.amount)}`,
              `🏷️ *Kategori:* ${parsed.data.category || "Lainnya"}`,
              `💳 *Metode:* ${parsed.data.payment_method || "Cash"}`,
              `📝 *Keterangan:* ${parsed.data.note || "-"}`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `_Data otomatis diperbarui di Web Dashboard._`,
            ].join("\n");
          } catch (dbErr: any) {
            console.warn("⚠️ [DB Warning]:", dbErr.message);
            replyMessage = `✅ (AI Terdeteksi) Catatan Keuangan: ${parsed.data.type === "income" ? "Pemasukan" : "Pengeluaran"} ${formatRupiah(parsed.data.amount)} [${parsed.data.category}].\n\n_Catatan: Konfigurasikan SUPABASE_URL di .env untuk menyimpan data ke database._`;
          }
        }
        break;
      }

      case "REMINDER": {
        if (parsed.data?.message && parsed.data?.remind_at) {
          try {
            await addReminder({
              user_id: jid,
              message: parsed.data.message,
              remind_at: parsed.data.remind_at,
            });

            const remindDate = new Date(parsed.data.remind_at);
            const timeStr = remindDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            });
            const dateStr = remindDate.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            });

            replyMessage = [
              `⏰ *Pengingat Berhasil Dijadwalkan!*`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `📌 *Agenda:* ${parsed.data.message}`,
              `🕒 *Waktu:* ${dateStr}, pukul ${timeStr} WIB`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `_Saya akan mengirimkan pesan WhatsApp saat waktunya tiba._`,
            ].join("\n");
          } catch (dbErr: any) {
            console.warn("⚠️ [DB Warning]:", dbErr.message);
            replyMessage = `⏰ Pengingat terdeteksi untuk: "${parsed.data.message}" pada ${parsed.data.remind_at}.\n\n_Catatan: Sambungkan Supabase agar scheduler dapat menyimpannya._`;
          }
        }
        break;
      }

      case "NOTE": {
        if (parsed.data?.content) {
          try {
            await addNote({
              user_id: jid,
              title: parsed.data.title || "Catatan Cepat",
              content: parsed.data.content,
              category: parsed.data.category || "Umum",
            });

            replyMessage = [
              `📝 *Catatan Berhasil Disimpan!*`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `📌 *Judul:* ${parsed.data.title || "Catatan Cepat"}`,
              `📄 *Isi:* ${parsed.data.content}`,
              `🏷️ *Kategori:* ${parsed.data.category || "Umum"}`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              `_Bisa diakses kapan saja lewat Web Dashboard._`,
            ].join("\n");
          } catch (dbErr: any) {
            console.warn("⚠️ [DB Warning]:", dbErr.message);
            replyMessage = `📝 Catatan tersimpan di AI: "${parsed.data.content}".\n\n_Catatan: Sambungkan Supabase untuk penyimpanan permanen._`;
          }
        }
        break;
      }

      case "QUERY_FINANCE": {
        try {
          const summary = await getFinancesSummary(jid);
          const recents = await getRecentFinances(jid, 3);

          const recentLines = recents.map((r) => {
            const sym = r.type === "income" ? "+" : "-";
            return `• ${sym} ${formatRupiah(r.amount)} (${r.category}) - _${r.note || ""}_`;
          });

          replyMessage = [
            `📊 *Ringkasan Keuangan Anda Bulan Ini*`,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `🟢 *Pemasukan:* ${formatRupiah(summary.income)}`,
            `🔴 *Pengeluaran:* ${formatRupiah(summary.expense)}`,
            `💰 *Sisa Saldo:* ${formatRupiah(summary.balance)}`,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `📋 *3 Transaksi Terakhir:*`,
            recentLines.length > 0 ? recentLines.join("\n") : "_Belum ada transaksi bulan ini._",
            `━━━━━━━━━━━━━━━━━━━━━`,
            `_Cek grafik visual lengkap di Web Dashboard._`,
          ].join("\n");
        } catch (dbErr: any) {
          replyMessage = `Belum ada data keuangan yang tersimpan. Coba ketik misal: *"Beli makan 25rb"*`;
        }
        break;
      }

      case "QUERY_REMINDERS": {
        try {
          const reminders = await getPendingReminders(jid);
          if (reminders.length === 0) {
            replyMessage = `ℹ️ Anda tidak memiliki pengingat aktif saat ini.\nKetik misal: *"Ingatkan rapat besok jam 9 pagi"* untuk membuat pengingat.`;
          } else {
            const listLines = reminders.map((r, i) => {
              const d = new Date(r.remind_at);
              const time = d.toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return `${i + 1}. 📌 *${r.message}* (🕒 ${time} WIB)`;
            });

            replyMessage = [
              `⏰ *Daftar Pengingat Aktif Anda:*`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              listLines.join("\n"),
              `━━━━━━━━━━━━━━━━━━━━━`,
            ].join("\n");
          }
        } catch (dbErr) {
          replyMessage = "Belum ada daftar pengingat yang tersimpan.";
        }
        break;
      }

      case "QUERY_NOTES": {
        try {
          const notes = await getNotes(jid, 5);
          if (notes.length === 0) {
            replyMessage = `ℹ️ Belum ada catatan yang tersimpan.\nKetik misal: *"Catat ide: Bikin aplikasi mobile"* untuk membuat catatan baru.`;
          } else {
            const noteLines = notes.map((n, i) => `${i + 1}. *${n.title}*: ${n.content}`);
            replyMessage = [
              `📝 *Catatan Terakhir Anda:*`,
              `━━━━━━━━━━━━━━━━━━━━━`,
              noteLines.join("\n"),
              `━━━━━━━━━━━━━━━━━━━━━`,
            ].join("\n");
          }
        } catch (dbErr) {
          replyMessage = "Belum ada catatan yang tersimpan.";
        }
        break;
      }

      case "CHAT":
      default: {
        // Balasan percakapan santai dari Gemini
        break;
      }
    }

    // 3. Kirim pesan balasan ke WhatsApp pengguna
    await sock.sendMessage(jid, { text: replyMessage });
    console.log(`📤 [Pesan Terkirim] Ke: ${jid}`);
  } catch (error: any) {
    console.error("❌ [Handler Error]:", error?.message || error);
  } finally {
    // Hentikan status "composing"
    if (msg.key?.remoteJid) {
      await sock.sendPresenceUpdate("paused", msg.key.remoteJid);
    }
  }
};

