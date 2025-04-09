import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missions = [
  "Get the first names of both of their parents.",
  "Play rock-paper-scissors with them.",
  "Get them to draw a sketch or a diagram.",
  "Make them jump into the pool fully clothed.",
  "Make them replace an object you’ve moved twice.",
  "Have them finish two of your sentences.",
  "Get them to reveal their mission to you.",
  "Place an object in their pocket without them noticing.",
  "Make them speak in another language.",
  "Successfully insert a specific phrase into a conversation with them.",
  "Find an excuse to give them a kiss on the cheek.",
  "Have them show you their socks.",
  "Get them to lend you their watch.",
  "Make them give you a phone number.",
  "Make them help you with your (fake) mission.",
  "Serve them a drink but give them the wrong one.",
  "Get the first names of their parents.",
  "Make them cross their arms by mimicking you or through persuasion.",
  "Make them say three different colors.",
  "Make them insult you (gently).",
  "Swap mission slips with them without them noticing.",
  "Get them to take a photo of you with their phone and send it to you via SMS.",
  "Drink from their glass.",
  "Make them leave the party location to check something for no reason.",
  "Get them to compliment you.",
  "Obtain their phone number.",
  "The victim must drink an improbable mixture of 2 drinks, examples: Coke-Orangina or whiskey-vodka or rum-coffee;",
  "You dance a slow dance;",
  "You take a selfie together;",
  "Your victim imitates an animal;",
  "You have the honor of seeing their driver’s license photo (if not, their ID card);",
  "The victim agrees to be mummified in toilet paper;",
  "Make your target believe they have something on their face to the point they go look in a mirror themselves;",
  "Make your target repeat three times in a row;",
  "Sneeze twice and get a “bless you” or “gesundheit” twice;",
  "Get a tissue or a paper napkin;",
  "Make your victim toast with you;",
  "Make your victim toast with the host of the party;",
  "Your target must open a beer for you, if not, they must pour you a glass from an unopened bottle;",
  "Take a selfie with your target while making a face (both of you);",
  "Make your target say the name of their birth town;",
  "Tell a joke to your target, they must laugh;",
  "Your “prey” is about to serve themselves food, you take what they were going to serve themselves, leaving them empty-handed;",
  "Your target agrees to swap their mission with yours;",
  "Make your target say the name of a specific series or movie;",
  "Embarrass your target in front of witnesses when they come out of the bathroom;",
  "Hang something on your victim’s back without them noticing for 5 minutes;",
  "Find out what your target ate the night before;",
  "Make your target stick their finger in their ear;",
  "Provoke your target to get annoyed with you."
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
