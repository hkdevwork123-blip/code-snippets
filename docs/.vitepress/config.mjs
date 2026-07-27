import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Code Snippets",
  description: "My Code snippets",
  base: "/code-snippets/",
  themeConfig: {
    logo: "/com-laptop-code-svgrepo-com.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/About" },
      { text: "Code", link: "/SQL" },
    ],

    sidebar: [
      {
        items: [
          { text: "About", link: "/About" },
          { text: "AI & LLM's", link: "/ai-llm" },
          { text: "Airflow", link: "/Airflow" },
          { text: "API's", link: "/API" },
          { text: "AWS", link: "/AWS" },
          { text: "Azure", link: "/Azure" },
          { text: "Backstage", link: "/Backstage" },
          { text: "CSS", link: "/CSS" },
          { text: "Docker", link: "/Docker" },
          { text: "Flink", link: "/flink" },
          { text: "Git", link: "/Git" },
          { text: "HTML", link: "/HTML" },
          { text: "Java", link: "/Java" },
          { text: "JavaScript", link: "/JavaScript" },
          { text: "Kubernetes", link: "/kubernetes" },
          { text: "MCP", link: "/MCP" },
          { text: "Networking", link: "/Networking" },
          { text: "Node", link: "/Node" },
          { text: "Playwright", link: "/Playwright" },
          { text: "Python", link: "/Python" },
          { text: "React + Next JS", link: "/Nextjs" },
          { text: "Shell", link: "/Shell" },
          { text: "SQL", link: "/SQL" },
          { text: "Terraform", link: "/Terraform" },
          { text: "TypeScript", link: "/TypeScript" },
          { text: "Vite", link: "/vite" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/hkdevwork123-blip/code-snippets",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © HK",
    },
  },
});
