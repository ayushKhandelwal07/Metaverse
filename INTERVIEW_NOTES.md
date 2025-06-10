# Metaverse Project - Interview Notes

## Project Overview
**Metaverse** is a 2D multiplayer virtual world application where users can walk around, meet people, chat, and collaborate in real-time. It supports video calls, screen sharing, and office-like environments for remote work/social interactions.

## 🏗️ High-Level Architecture

### Frontend (React + Phaser)
- **Location**: `/client/`
- **Tech Stack**: React 18, TypeScript, Vite, Phaser 3, Redux Toolkit
- **Purpose**: Handles UI, game rendering, and client-side logic

### Backend (Colyseus Server)
- **Location**: `/server/`
- **Tech Stack**: Node.js, TypeScript, Colyseus, Express
- **Purpose**: Manages real-time multiplayer state, room management

### Deployment
- **Nginx Configuration**: Separate configs for frontend and backend
- **Domains**: 
  - Backend: `metaverse.ayushworks.tech`
  - Frontend: `metaverse-fe.ayushworks.tech`
- **SSL**: Let's Encrypt certificates

## 🛠️ Technology Stack Deep Dive

### Frontend Technologies
1. **React 18** - Main UI framework
2. **Phaser 3** - 2D game engine for world rendering and player movement
3. **Redux Toolkit** - State management with Immer for immutable updates
4. **Colyseus.js** - Client-side real-time communication
5. **PeerJS** - Peer-to-peer video calls and screen sharing
6. **ShadCN UI + Tailwind CSS** - Modern, responsive UI components
7. **Framer Motion** - Smooth UI animations
8. **Vite** - Fast build tool and development server

### Backend Technologies
1. **Colyseus** - Real-time multiplayer game server framework
2. **Express.js** - HTTP server and API endpoints
3. **TypeScript** - Type-safe server development
4. **CORS** - Cross-origin resource sharing
5. **PM2** - Process management (ecosystem.config.js)

## 📁 Project Structure

```
Metaverse/
├── client/                 # Frontend React application
│   ├── src
│   │   ├── app/           # Redux store and state management
│   │   ├── components/    # React components
│   │   ├── game/          # Phaser game logic
│   │   └── lib/           # Utility libraries
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── server/                # Backend Colyseus server
│   ├── src/
│   │   ├── rooms/         # Game room logic and schema
│   │   └── index.ts       # Server entry point
│   └── build/             # Compiled TypeScript output
└── nginx configs          # Deployment configurations
```

## 🎮 Game Architecture (Phaser)

### Core Game Files
- **`main.ts`**: Phaser game configuration and initialization
- **`GameScene.ts`**: Main game scene with world rendering
- **`Network.ts`**: Handles Colyseus client connection and real-time sync
- **`MyPlayer.ts`**: Local player controller with movement and interactions
- **`Player.ts`**: Other players' representation
- **`Bootstrap.ts`**: Asset loading and initial setup

### Game Features
- **2D Arcade Physics**: Gravity-free movement system
- **Real-time Multiplayer**: Synchronized player positions and animations
- **Office Zones**: Different office areas (Main, East, North1, North2, West)
- **Avatar System**: Player sprites with animations
- **Collision Detection**: Boundaries and interactive areas

## 🔄 State Management (Redux)

### Store Structure
```typescript
{
  chat: chatReducer,        // Chat functionality
  room: roomReducer,        // Room connection state
  screen: screenReducer,    // Screen sharing state
  webcam: webcamReducer     // Video call state
}
```

### Key Features
- **Immer Integration**: Immutable state updates with MapSet support
- **Non-serializable State**: Handles complex objects like peer connections
- **TypeScript Integration**: Fully typed store with RootState and AppDispatch

## 🏢 Room System (Colyseus)

### Room Types
1. **LOBBY_ROOM**: Default Colyseus lobby for room discovery
2. **PUBLIC_ROOM**: Open rooms anyone can join
3. **PRIVATE_ROOM**: Invite-only rooms with realtime listing

### Room State Schema
```typescript
class MyRoomState {
  players: MapSchema<Player>           // All connected players
  globalChat: ArraySchema<OfficeChat>  // Global chat messages
  
  // Office-specific data
  mainOfficeMembers: MapSchema<string>
  mainOfficeChat: ArraySchema<OfficeChat>
  eastOfficeMembers: MapSchema<string>
  eastOfficeChat: ArraySchema<OfficeChat>
  // ... (North1, North2, West offices)
}
```

### Player Schema
```typescript
class Player {
  x: number              // X position
  y: number              // Y position  
  username: string       // Display name
  anim: string          // Current animation
  isMicOn: boolean      // Audio state
  isWebcamOn: boolean   // Video state
  isDisconnected: boolean // Connection status
}
```

## 💬 Communication Features

### Chat System
- **Global Chat**: Available to all users in the world
- **Office Chat**: Location-specific chat for each office area
- **Message Types**: Player joined/left notifications and regular messages
- **Real-time Sync**: Powered by Colyseus state synchronization

### Video Communication (PeerJS)
- **Video Calls**: Peer-to-peer video communication
- **Screen Sharing**: Share screens within office areas
- **Audio Control**: Toggle microphone on/off
- **Camera Control**: Toggle webcam on/off

## 🎨 UI/UX Components

### Main Components
- **`RoomSelection`**: Initial room joining interface
- **`Chat`**: Chat interface with global/office modes
- **`VideoCall`**: Video communication UI
- **`ScreenShare`**: Screen sharing interface
- **`FloatingActions`**: Action buttons overlay
- **`VideoPlayer`**: Individual video stream component

### UI Libraries
- **Radix UI**: Accessible component primitives (Dialog, Label, Tooltip)
- **ShadCN**: Pre-built component library
- **Lucide React**: Icon system
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations and transitions

## 🔧 Development & Build

### Scripts
**Frontend:**
- `npm run dev`: Development server with Vite
- `npm run build`: Production build
- `npm run dev-nolog`: Development without logging

**Backend:**
- `npm run dev`: Development with tsx watch
- `npm run build`: TypeScript compilation
- `npm run start`: Production server
- `npm run loadtest`: Performance testing

### Configuration Files
- **`vite.config.ts`**: Vite build configuration
- **`tsconfig.json`**: TypeScript compiler options
- **`components.json`**: ShadCN component configuration
- **`ecosystem.config.js`**: PM2 process management

## 🚀 Deployment & DevOps

### Nginx Setup
- **Frontend Server**: Serves React SPA with proper routing
- **Backend Proxy**: Proxies WebSocket connections to Colyseus
- **SSL Termination**: Let's Encrypt certificates
- **Static Asset Caching**: 1-year cache for assets

### Production Considerations
- **WebSocket Support**: Nginx configured for WebSocket upgrades
- **CORS Configuration**: Proper cross-origin setup
- **Process Management**: PM2 for server stability
- **Asset Optimization**: Vite production builds with Terser

## 🎯 Key Features to Highlight

1. **Real-time Multiplayer**: Seamless synchronization of player movements and interactions
2. **Office Simulation**: Multiple office areas with location-based features
3. **Integrated Communication**: Text chat + video calls + screen sharing
4. **Modern Tech Stack**: Latest React, TypeScript, and WebRTC technologies
5. **Scalable Architecture**: Modular design with clear separation of concerns
6. **Production Ready**: Full deployment pipeline with SSL and process management

## 🔍 Technical Challenges Solved

1. **State Synchronization**: Complex state management between client and server
2. **Real-time Communication**: WebSocket + WebRTC integration
3. **Game Performance**: Optimized Phaser rendering for multiplayer
4. **Cross-browser Compatibility**: WebRTC peer connections
5. **Scalable Deployment**: Nginx load balancing and SSL termination

## 📈 Performance Optimizations

1. **Asset Loading**: Efficient sprite and asset management
2. **State Updates**: Minimal re-renders with Redux selectors
3. **Network Optimization**: Colyseus delta compression
4. **Build Optimization**: Vite tree-shaking and code splitting
5. **Caching Strategy**: Static asset caching with proper headers

This covers the complete architecture and implementation details of your Metaverse project for interview discussions! 


1️⃣ server/src/rooms/schema/MyRoomState.ts     (Foundation - 44 lines)
2️⃣ server/src/rooms/MyRoom.ts                 (Core Logic - 391 lines)  
3️⃣ server/src/index.ts                        (Server Setup - 40 lines)

1️⃣ client/src/game/EventBus.ts               (Bridge - 12 lines)
2️⃣ client/src/app/store.ts + Redux Slices    (State Mgmt - ~100 lines)
3️⃣ client/src/game/scenes/Network.ts         (Communication - 434 lines)
4️⃣ client/src/game/scenes/GameScene.ts       (Game Engine - 408 lines)
5️⃣ client/src/game/scenes/MyPlayer.ts        (Player Logic - 413 lines)