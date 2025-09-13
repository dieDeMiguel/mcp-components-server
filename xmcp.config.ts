import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  paths: {
    tools: "src/tools",
    prompts: false, // Disable prompts since we don't use them
  },
};

export default config;
