import { EmbedBuilder, WebhookClient, WebhookClientData } from "discord.js";
import { globalConfig } from "../global";
import Log from "./Log";
import { ProductData } from "./types";

if (globalConfig.webhook_url.length === 0) {
  Log.Error(
    "Discord webhook url cannot be empty, insert it in the config.json file"
  );
  process.exit();
}

const hooks: WebhookClient[] = [];
const botSettings = globalConfig.discord_message_settings;

const setBotName = botSettings.botName && botSettings.botName !== "";
const setBotImage = botSettings.botImage && botSettings.botImage !== "";

globalConfig.webhook_url.forEach((url: string) => {
  const hook = new WebhookClient({
    url: url,
  } as WebhookClientData);

  hooks.push(hook);
});

const Discord: any = {}; // You can define proper types for Discord object

Discord.notifyProduct = async ({
  title,
  sellerUrl,
  image,
  url,
  variants,
  status,
}: any) => {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setAuthor(setBotName ? { name: setBotName.toString() } : null)
    .setThumbnail(setBotImage.toString())
    .setURL(url);

  const availableVariants = variants.filter((x: any) => x.available);
  if (availableVariants.length > 0) {
    const sizesDescription: string[] = [""];
    let count = 0;

    availableVariants.forEach((x: ProductData) => {
      const toAdd = `${x.title} / ${x.id} / [[ATC](https://${sellerUrl}/cart/add?id=${x.id})]\n`;

      sizesDescription[count] = sizesDescription[count] || "";

      if ((sizesDescription[count] || "").length + toAdd.length > 1024) {
        sizesDescription.push(toAdd);
        count++;
      } else {
        sizesDescription[count] += toAdd;
      }
    });

    sizesDescription.forEach((x) => {
      embed.addFields({ name: "**Sizes**", value: x, inline: true });
    });
  }

  embed.addFields("**Price**", variants[0].price, true);

  if (status.length > 0) {
    embed.addFields("**Status**", status.join("\n"), true);
  }

  embed
    .addFields({
      name: "**Links**",
      value: `[[Cart](https://${sellerUrl}/cart)]`,
      inline: true,
    })
    .setThumbnail(image);

  if (botSettings.footerDescription || botSettings.footerImage) {
    embed.setFooter({ text: botSettings.footerDescription });
  }

  if (botSettings.timeOfNotification) {
    embed.setTimestamp();
  }

  hooks.forEach((hook) => {
    hook.send({ embeds: [embed] });
  });
};

Discord.info = async (title: string) => {
  hooks.forEach((hook) => {
    hook.send(title);
  });
};

export default Discord;
