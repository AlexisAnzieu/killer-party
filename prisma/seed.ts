import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missions =  [
  "Obtenir les prénoms de ses deux parents.",
  "Jouer à pierre-feuille-ciseaux avec lui/elle.",
  "Le/la faire dessiner un croquis ou un diagramme.",
  "Lui faire terminer deux de vos phrases.",
  "Le/la faire révéler sa mission.",
  "Placer un objet dans sa poche sans qu'il/elle ne s'en aperçoive.",
  "Le/la faire parler dans une autre langue.",
  "Lui faire porter une partie de ton déguisement.",
  "Le/la faire vous prêter sa montre.",
  "Le/la faire vous donner un numéro de téléphone.",
  "Le/la faire croiser les bras en l'imitant ou par persuasion.",
  "Le/la faire dire trois couleurs différentes.",
  "Le/la faire prendre une photo de vous et vous l'envoyer.",
  "Obtenir son numéro de téléphone.",
  "Lui faire boire un mélange de deux boissons différentes.",
  "Prendre un selfie ensemble.",
  "Le/la faire imiter un animal.",
  "Le/la faire répéter trois fois de suite.",
  "Éternuer trois fois et obtenir un 'à tes souhaits' trois fois.",
  "Lui faire faire le YMCA.",
  "Lui faire dire 'ok boomer'.",
  "Lui faire chanter le générique d'une série.",
  "Lui faire lancer une macarena.",
  "Obtenir sa signature.",
  "Le/la faire marcher avec un objet sur la tête.",
  "Le/la faire imiter l'accent québécois.",
  "Le/la faire effectuer un dab.",
  "Lui faire révéler son signe astrologique.",
  "Prendre une photo avec son portable et se la faire envoyer.",
  "Le/la faire danser avec une personne de votre choix.",
  "Lui faire croire que vous avez vécu à Ypres.",
  "Lui faire croire que vous avez une personne connue dans votre famille.",
  "Lui serrer la main à 3 occasions différentes.",
  "Lui servir une boisson chaude.",
  "Gagner à 'je te tiens par la barbichette'.",
  "Lui faire dire le nom de sa mère.",
  "Le/la faire raconter une blague.",
  "Le/la faire dire 'Obama' sans jamais le mentionner.",
  "Lui faire dire 'Trump' sans jamais le mentionner.",
  "Le/la faire faire 2 fois le tour d'un même arbre en moins d'une minute.",
  "Le/la faire imiter la gestuelle d'un animal de votre choix.",
  "Raconter une blague et le/la faire rire (sourire ne compte pas).",
  "Le/la complimenter (tenue ou autre) pour réussir votre mission.",
  "Lui faire imiter la voix d'un invité de votre choix.",
  "Prendre une photo avec exactement 6 autres personnes.",
  "Faire un combat de pouce.",
  "Lui faire porter votre verre pendant 1 minute tout en lui parlant.",
  "Connaître son orientation politique.",
  "Le/la faire boire son verre cul sec.",
  "Lui faire vous gratter la tête pendant plus de 10 secondes.",
  "Le/la faire prononcer la phrase 'Danse des Canards' sans la mentionner.",
  "Lui faire citer 3 rois de France.",
  "Lui faire citer 3 merveilles du monde.",
  "Le/la faire mimer une cigarette ou l'action de fumer.",
  "Lui faire révéler ses origines.",
  "Lui faire révéler son année de naissance.",
  "Lui faire dire le nom de sa banque.",
  "Le/la faire vous payer un verre.",
  "Le convaincre que vous êtes la fille d'une actrice de cinéma connue.",
  "Le/la faire sursauter.",
  "Lui faire dire une chose puis son contraire.",
  "Lui faire lancer une chenille (la danse pas l'animal).",
  "Lui faire énoncer le théorème de Pythagore.",
  "Le/la faire vous montrer une photo de lui/elle sur son portable.",
  "Le/la faire vous lister les noms de 4 personnes de la soirée à la suite.",
  "Lui faire citer 5 Pokémon.",
  "Défier la personne au bras de fer.",
  "L'appeler par un autre nom sans qu'il/elle vous reprenne.",
  "Lui faire prendre un shot.",
  "Lui faire croire que vous avez déjà mixé à Burning Man.",
  "Lui faire vous montrer son meilleur pas de danse.",
  "Lui faire croire que vous êtes pour l'indépendance de la Bretagne.",
  "Le/la faire vous chanter une chanson.",
  "Réussir à faire parler la personne anglais, espagnol ou allemand pendant au moins 20 sec.",
  "Obtenir son adresse exacte (numéro - rue - code postal)."
];

async function main() {
  for (const description of missions) {
    await prisma.mission.upsert({
      where: { description },
      update: {},
      create: { description },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
