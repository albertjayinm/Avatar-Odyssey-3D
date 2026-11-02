# Avatar Odyssey 3D

A cozy 3D creature-adventure game built with React and Three.js. Explore biomes, gather resources, befriend companions, complete quests, and decorate a habitat.

## Features

- Explore multiple 3D biomes with keyboard and touch controls.
- Gather berries, crystals, and other resources.
- Befriend creatures and choose an active companion.
- Craft and place habitat decorations.
- Complete quests, earn experience, and unlock new areas.
- Chat with companions and generate side quests with Gemini. These features use built-in responses when no API key is configured.

## Getting started

### Requirements

- [Bun](https://bun.sh/) to install dependencies and run the project.
- A Gemini API key is optional; the game runs without one.

### Run locally

```sh
bun install
cp .env.example .env
```

To enable Gemini-powered companion chat and quest generation, add your key to `.env`:

```dotenv
GEMINI_API_KEY=your_api_key
```

Then start the development server:

```sh
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Build the web app and production server |
| `bun run start` | Run the production server after building |
| `bun run preview` | Preview the Vite production build |
| `bun run lint` | Run the TypeScript check |
| `bun run clean` | Remove generated build output |

## Gemini integration

The Express server calls Gemini for companion chat and dynamic quest generation. `GEMINI_API_KEY` is read by the server from the environment or `.env`; keep it private and do not commit your `.env` file. If the key is unset, those features use built-in responses.
