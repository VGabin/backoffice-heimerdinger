const giveRole = (user) => {
    try {
        const userRoles = user.roles.cache.map(role => role.name);
    
        // A remplacer le string quand on pourra récupérer l'info
        const wantedRole = user.guild.roles.cache.find(r => r.name === "basique");;
    
        if (!userRoles.includes(wantedRole)) {
            user.roles.add(wantedRole);
        }
    } catch (error) {
        console.log(error);
    }
}

const removeRoles = async (member) => {
    member.roles.cache.forEach(role => {
        if (role.name !== '@everyone' && role.editable && role.managed === false) {
            try {
                member.roles.remove(role);
            } catch (err) {
                console.warn(`❌ Impossible de retirer le rôle ${role.name} :`, err.message);
            }
        }
    });
};

const checkRoles = async (client) => {
    const today = new Date();
    const expirationDate = new Date("2025-05-17");

    const diffInDays = Math.round((expirationDate - today) / (1000 * 3600 * 24));

    for (const [guildId, guild] of client.guilds.cache) {
        console.log(`🔍 Vérification dans le serveur : ${guild.name}`);

        try {
            // Récupère tous les membres du serveur
            await guild.members.fetch();

            guild.members.cache.forEach(member => {
                const userId = member.user.id;

                if ([1,3,10].includes(diffInDays)) {
                    if (member.user.tag == "magaliott") {
                        client.users.fetch(userId).then(user => {
                            return user.send(`Attention ! Il vous reste ${diffInDays} jour(s) d'abonnement !`);
                        })
                        .then(() => {
                            console.log("Message envoyé !");
                        })
                        .catch(error => {
                            console.error("Erreur lors de l'envoi du message :", error);
                        });
                    }
                } else if (diffInDays <= 0) {
                    if (member.user.tag == "magaliott") {
                        client.users.fetch(userId).then(async (user) => {
                            removeRoles(await guild.members.fetch(userId));
                            return user.send("Abonnement expiré !");
                        })
                        .then(() => {
                            console.log("Message envoyé !");
                        })
                        .catch(error => {
                            console.error("Erreur lors de l'envoi du message :", error);
                        });
                    }
                } else {
                    return true;
                }
                // Exemple : afficher les rôles
                // const roleNames = member.roles.cache.map(role => role.name).join(', ');
            });

        } catch (error) {
            console.error(`❌ Erreur dans le serveur ${guild.name} :`, error);
        }
    }
}

export { giveRole, removeRoles, checkRoles };