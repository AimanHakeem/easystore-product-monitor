import { EmbedBuilder, WebhookClient, WebhookClientData } from "discord.js";
import { globalConfig } from "../global";
import Log from "./Log";
import { DiscordData, APIEmbedField, Variants } from "./types";

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
  images,
  url,
  handle,
  variants,
  available,
}: DiscordData) => {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setURL(url)
    .setThumbnail(images)
    .setColor('#00ff00');


  if (setBotName && setBotImage) {
    embed.setAuthor({
      name: botSettings.botName,
      iconURL: botSettings.botImage,
      url: url,
    });
  }
  const availableVariants = variants.filter((x: Variants) => x.available);
  if (availableVariants.length > 0) {
    const sizesDescription: string[] = [""];
    let count = 0;

    availableVariants.forEach((x: Variants) => {
      const toAdd = `${x.title} | **Instock:** ${x.available} | **Quantity:** ${x.inventory_quantity}\n`;

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

  embed.addFields([
    {
      name: "**Price**",
      value: ((variants[0]?.price ?? 0) / 100).toFixed(2).toString(),
      inline: true,
    } as APIEmbedField,
  ]);

  embed.addFields([
    {
      name: "**Instock**",
      value: available.toString(),
      inline: true,
    } as APIEmbedField,
  ]);

  embed
    .addFields({
      name: "**Links**",
      value: `[[Direct Link](${url})]`,
      inline: true,
    })
    .setThumbnail(images);

  if (botSettings.footerDescription || botSettings.footerImage) {
    embed.setFooter({
      text: botSettings.footerDescription ? botSettings.footerDescription : "",
    });
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
