const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Pas de code !");

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_ID,
        client_secret: process.env.DISCORD_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
        scope: "identify",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenRes.data.access_token}`,
      },
    });

    req.session.user = userRes.data;
    res.redirect("/");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send(err.message);
    }
    res.redirect("/");
  });
});

module.exports = router;
