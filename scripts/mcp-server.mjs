#!/usr/bin/env node

import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, matchSkills, readSkill } from "./lib/skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await loadManifest(root);

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function reply(id, value) {
  send({ jsonrpc: "2.0", id, result: value });
}

function error(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

const tools = [
  {
    name: "list_skills",
    description: "List available skills. Filter by category when needed.",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string", description: "Optional category filter" } },
    },
  },
  {
    name: "get_skill",
    description: "Read the full instructions for one skill by name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Skill directory name" } },
      required: ["name"],
    },
  },
  {
    name: "match_skill",
    description: "Suggest the best skills for a plain-language request using the same router as the public eval.",
    inputSchema: {
      type: "object",
      properties: {
        request: { type: "string", description: "The user's request" },
        limit: { type: "number", description: "Maximum number of suggestions, default 3" },
      },
      required: ["request"],
    },
  },
  {
    name: "get_manifest",
    description: "Read the skill manifest with categories, tags, triggers and related skills.",
    inputSchema: { type: "object", properties: {} },
  },
];

async function callTool(name, args) {
  if (name === "list_skills") {
    const skills = manifest.skills.filter((skill) => !args.category || skill.category === args.category);
    return JSON.stringify(skills.map(({ name: skillName, category, tags }) => ({ name: skillName, category, tags })), null, 2);
  }
  if (name === "get_skill") {
    if (!args.name) return { text: "Missing 'name'.", isError: true };
    const text = await readSkill(root, args.name).catch(() => null);
    return text === null ? { text: `Unknown skill: ${args.name}`, isError: true } : { text };
  }
  if (name === "match_skill") {
    if (!args.request) return { text: "Missing 'request'.", isError: true };
    const limit = Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), 10) : 3;
    return JSON.stringify(matchSkills(args.request, manifest, limit), null, 2);
  }
  if (name === "get_manifest") return JSON.stringify(manifest, null, 2);
  return { text: `Unknown tool: ${name}`, isError: true };
}

async function handle(message) {
  const id = message.id;
  const notify = id === undefined;
  try {
    if (message.method === "initialize") {
      reply(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "dev-agent-skills", version: "2.0.0" },
      });
      return;
    }
    if (message.method === "notifications/initialized") return;
    if (message.method === "ping") {
      reply(id, {});
      return;
    }
    if (message.method === "tools/list") {
      reply(id, { tools });
      return;
    }
    if (message.method === "tools/call") {
      const { name, arguments: args = {} } = message.params || {};
      const output = await callTool(name, args);
      const text = typeof output === "string" ? output : output.text;
      reply(id, {
        content: [{ type: "text", text }],
        ...(output.isError ? { isError: true } : {}),
      });
      return;
    }
    if (message.method === "resources/list") {
      reply(id, {
        resources: manifest.skills.map((skill) => ({
          uri: `skill://${skill.name}`,
          name: skill.name,
          description: skill.tags.join(", "),
          mimeType: "text/markdown",
        })),
      });
      return;
    }
    if (message.method === "resources/read") {
      const uri = message.params?.uri || "";
      const name = uri.startsWith("skill://") ? uri.slice(8) : "";
      const text = name ? await readSkill(root, name).catch(() => null) : null;
      if (text === null) {
        error(id, -32002, `Unknown resource: ${uri}`);
        return;
      }
      reply(id, { contents: [{ uri, mimeType: "text/markdown", text }] });
      return;
    }
    if (!notify) error(id, -32601, `Method not found: ${message.method}`);
  } catch (caught) {
    if (!notify) error(id, -32603, caught.message);
  }
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    error(null, -32700, "Parse error");
    return;
  }
  void handle(message);
});
