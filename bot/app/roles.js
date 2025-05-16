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

const removeRole = () => {
    const user = message.member;
    const userRoles = user.roles.cache.map(role => role.name);

    // A remplacer le string quand on pourra récupérer l'info
    const unwantedRole = message.guild.roles.cache.find(r => r.name === "basique");;

    if (userRoles.includes(unwantedRole)) {
        user.roles.remove(unwantedRole);
    }
}

const checkRoles = (client, member) => {
    const userId = member.user.id;
    console.log(userId);

    const today = new Date();
    const tomorrow = new Date("2025-05-16");

    console.log((tomorrow - today) / (1000 * 3600 * 24));
    

    if (member.user.tag == "miss.neeko") {
        // client.users.fetch(userId).then(user => {
        //     return user.send("Salut beau gosse");
        // })
        // .then(() => {
        //     console.log("Message envoyé !");
        // })
        // .catch(error => {
        //     console.error("Erreur lors de l'envoi du message :", error);
        // });
    }
}

export { giveRole, removeRole, checkRoles };