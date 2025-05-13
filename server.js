require("dotenv").config();
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.set('view engine', 'pug');
app.set('views', './src/views');
app.use(express.static("public"));

app.get("/", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.render("login", { clientId: CLIENT_ID, redirectUri: REDIRECT_URI });
  }
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Pas de code !");

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
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
    console.error(err);
    res.send("Erreur pendant la connexion.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.send("Erreur pendant la déconnexion.");
    }
    res.redirect("/");
  });
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
