import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { config } from "../config";
import { handleIncomingMessage } from "./handlers";

let currentSocket: WASocket | null = null;
let isConnected = false;
let qrCodeString = "";

export const getBaileysSocket = (): WASocket | null => {
  return currentSocket;
};

export const getBotStatus = () => {
  return {
    isConnected,
    qrCode: qrCodeString,
    botName: config.botName,
  };
};

export const initBaileys = async (): Promise<WASocket> => {
  const { state, saveCreds } = await useMultiFileAuthState(config.authFolder);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`🤖 Menghubungkan WhatsApp menggunakan Baileys v${version.join(".")} (Terbaru: ${isLatest})...`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }), // Heningkan log verbose internal Baileys
    printQRInTerminal: false,          // Kita cetak kustom menggunakan qrcode-terminal
    browser: ["AssistAI Personal", "Chrome", "1.0.0"],
  });

  currentSocket = sock;

  // Event: Update Kredensial & Sesi
  sock.ev.on("creds.update", saveCreds);

  // Event: Status Koneksi
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeString = qr;
      console.log("\n=======================================================");
      console.log("📱 SCAN QR CODE BERIKUT DENGAN WHATSAPP ANDA:");
      console.log("=======================================================");
      qrcode.generate(qr, { small: true });
      console.log("Buka WhatsApp -> Perangkat Tertaut (Linked Devices) -> Tautkan Perangkat.");
      console.log("=======================================================\n");
    }

    if (connection === "close") {
      isConnected = false;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        `⚠️ Koneksi terputus (Status Code: ${statusCode}). Mencoba menghubungkan kembali: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        setTimeout(() => {
          initBaileys();
        }, 5000);
      } else {
        console.log("🛑 Sesi WhatsApp telah Logout. Silakan restart bot untuk scan QR baru.");
      }
    } else if (connection === "open") {
      isConnected = true;
      qrCodeString = "";
      console.log("\n🎉 [WhatsApp Connected] Bot Asisten AI siap digunakan!");
      console.log(`✅ Terhubung sebagai: ${sock.user?.id || sock.user?.name || "WhatsApp User"}\n`);
    }
  });

  // Event: Pesan Masuk
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Hanya tangani pesan yang bukan berasal dari bot itu sendiri (kecuali testing)
      if (!msg.key.fromMe) {
        await handleIncomingMessage(sock, msg);
      }
    }
  });

  return sock;
};

