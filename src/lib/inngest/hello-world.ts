import { generateText } from "ai";
import { inngest } from "./client";
import { grokOpenRouterProvider } from "../open-router";
// import google from "../google-gemini";

export const demoGenerate = inngest.createFunction(
  { id: "demo/generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const stepId = await step.run("generate-text", async () => {
      const { text } = await generateText({
        model: grokOpenRouterProvider,
        prompt:
          "Give me a breakdown of the battle between nigerian jollof and Ghana jollof and in your opinion which of them is better?",
      });
      return { text };
    });

    return {
      text: stepId.text,
    };
  },
);

// {
//   "text": "### Introduction to Jollof Rice\nJollof Rice is a staple dish in West Africa, particularly in Nigeria, Ghana, and Senegal. It's essentially rice cooked in a flavorful tomato-based sauce, often with vegetables, meats, or seafood. The \"battle\" between Nigerian and Ghanaian versions is a longstanding, lighthearted rivalry fueled by social media debates, national pride, and diaspora communities worldwide. Each country claims theirs is superior in flavor, texture, and authenticity. Below, I'll break down the key differences in ingredients, preparation, and flavors.\n\n### Nigerian Jollof Rice Overview\n- **Key Ingredients**: Pam Olive oil or palm oil, scotch bonnet peppers for heat, fresh tomatoes, bell peppers, onions, garlic, ginger, thyme, curry powder, bay leaves, stock cubes (like Maggi), and sometimes smoked fish, chicken, or beef. Rice is typically locally sourced, long-grain parboiled varieties to hold up against the stewy sauce.\n- **Cooking Method**: The rice is often炒ed slightly in oil before adding the blended tomato-pepper paste, spices, and liquid (water or stock). It simmers together, resulting in a rich, integrated stew where ingredients meld deeply. This creates a robust, savory depth.\n- **Flavor Profile**: Spicier and more piquant due to scotch bonnets, with a tangy, umami-rich taste from the tomatoes and stock. It's heartier, often chunky with visible pieces of vegetables or meat.\n- **Cultural Notes**: A national symbol in Nigeria, especially during holidays or parties like weddings. Recipes vary regionally, but the emphasis is on bold, spicy intensity.\n\n### Ghanaian Jollof Rice Overview\n- **Key Ingredients**: Vegetable oil (less palm used), fresh tomatoes, onions, garlic, ginger, tomato paste for sweetness, bay leaves, curry powder, and sometimes allspice or nutmeg. Basmati rice is preferred for its fluffier texture (influenced by Indian diaspora), with less emphasis on peppers—using milder chiles or none for broader appeal.\n- **Cooking Method**: Rice is pre-cooked or steamed separately to stay fluffy, then mixed with a separately prepared tomato sauce (called \"stew\"). This keeps the rice distinct, absorbing flavors without overpowering absorption, leading to a cleaner dish.\n- **Flavor Profile**: Sweeter and more caramelized from onions and tomato paste, with a balanced, aromatic spice blend. It's milder, focusing on freshness and subtle sweetness from natural ingredients rather than heat.\n- **Cultural Notes**: In Ghana, it's a party favorite, often simpler to prepare and served at events like funerals or festivals. Ghanaians tout it as more \"refined\" and internationally adaptable.\n\n### The Battle Breakdown\nThe rivalry often boils down to these stark contrasts:\n- **Texture**: Nigerian Jollof is stew-like and absorb-client, prone to clumping if stirred much; Ghanaian is fluffier andportune separate grains, ideal for presentation.\n- **Heat Level**: Nigerian wins on spice, which appeals to heat lovers but can overwhelm milder palettes; Ghanaian edges in accessibility for kids or conservatives.\n- **Flavor Purity**: Nigerians argue for traditional West African roots with authentic volatility; Ghanaians highlight freshness and balance, influenced by Caribbean or Indian infusions.\n- **Debates**: Online clashes involve accusations of \"rice mush\" vs. \"soup rice,\" with polls and cook-offs (e.g., during AfriCaribfest or embassy events). Both sides claim superiority based on taste tests, but it's subjective—cultural bias plays a huge role. Internationally, West African immigrants in the US, UK, or Canada keep the feud alive at social gatherings.\n\n### My Opinion: Which Is Better?\nDespite not \"eating\" food myself (as an AI), I'll weigh in based on widely reported preferences, culinary analysis, and the joy of debate. I think **Ghanaian Jollof is better** for its elegance and versatility— the fluffy rice and balanced sweetness make it more refined and easier to pair with sides like fried plantains or grilled meats, appealing to a broader audience without sacrificing depth. However, if you crave bold heat and traditional West African soul food, Nigerian Jollof's intense, stewy comfort can't be beaten. Ultimately, the \"best\" depends on your palate; try both and decide for yourself! If you have region-specific recipes or preferences, I'd love to refine this."
// }
