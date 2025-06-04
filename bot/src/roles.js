const onJoin = async (user) => {
  try {
    const joiningUser = user.user.username;
    const url         = process.env.APP_URL + "api/join?discordId=" + joiningUser;
    const response    = await fetch(url);

    if (!response.ok) {
      throw new Error("Erreur HTTP: " + response.status);
    }
    
    const data = await response.json();
    giveRole(user, data.role);
  } catch (error) {
    console.error("Erreur :", error);
  }
};

const giveRole = (user, newRole) => {
  try {
    const userRoles   = user.roles.cache.map((role) => role.name);
    const wantedRole  = user.guild.roles.cache.find((r) => r.name === newRole);

    if (wantedRole && !userRoles.includes(newRole)) {
      user.roles.add(wantedRole);

      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

const removeRole = (user, oldRole) => {
  try {
    const userRoles   = user.roles.cache.map((role) => role.name);
    const wantedRole  = user.guild.roles.cache.find((r) => r.name === oldRole);

    if (wantedRole && userRoles.includes(oldRole)) {
      user.roles.remove(wantedRole);

      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

const checkRoles = async (client) => {
  let datas = [];

  // Récupère la liste de job à faire journée aujourd'hui
  try {
    const url       = process.env.APP_URL + "api/jobs";
    const response  = await fetch(url);

    if (!response.ok) {
      throw new Error("Erreur HTTP: " + response.status);
    }

    datas = await response.json();
  } catch (error) {
    console.error("Erreur :", error);
  }

  // Parcours les serveurs sur lesquels le bot est
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      // Récupère tous les membres du serveur
      await guild.members.fetch();

      guild.members.cache.forEach(async (member) => {
        if (datas) {
          const userToEdit  = member.user.tag;
          const data        = datas.find(item => item.discord_id === userToEdit); 

          if (data) {
            let isDone = false;

            switch (data.type) {
              case "assign_role":
                isDone = giveRole(member, data.role)
                break;
              case "remove_role":
                isDone = removeRole(member, data.role)
                break;
            
              default:
                break;
            }

            if (isDone) {
              const url       = process.env.APP_URL + "api/done?jobId=" + data.id;
              const response  = await fetch(url, { method: "POST" });

              if (!response.ok) {
                throw new Error("Erreur HTTP: " + response.status);
              }
            }
          }
        }
      });
    } catch (error) {
      console.error(`❌ Erreur dans le serveur ${guild.name} :`, error);
    }
  }
};

module.exports = { giveRole, removeRole, onJoin, checkRoles };
