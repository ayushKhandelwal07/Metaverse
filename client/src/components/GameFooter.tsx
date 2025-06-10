import { useState } from "react";
import { useAppSelector } from "../app/hooks";
import { Button } from "./ui/button";
import {
    Camera,
    CameraOff,
    Mic,
    MicOff,
    ScreenShare,
    MessageCircle,
    Users,
    PhoneOff,
    User,
} from "lucide-react";
import store from "../app/store";
import { toggleMic, toggleWebcam } from "../app/features/webRtc/webcamSlice";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import phaserGame from "../game/main";
import { GameScene } from "../game/scenes/GameScene";
import { toast } from "sonner";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

interface GameFooterProps {
    isInsideOffice: boolean;
    username: string;
    setScreenDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
    showChat: boolean;
}

const GameFooter = ({
    isInsideOffice,
    username,
    setScreenDialogOpen,
    setShowChat,
    showChat,
}: GameFooterProps) => {
    const [showParticipants, setShowParticipants] = useState(false);
    const [shouldConnectToOtherPlayers, setShouldConnectToOtherPlayers] = useState(false);
    
    const myWebcamStream = useAppSelector((state) => state.webcam.myWebcamStream);
    const isWebcamOn = useAppSelector((state) => state.webcam.isWebcamOn);
    const isMicOn = useAppSelector((state) => state.webcam.isMicOn);
    const playerNameMap = useAppSelector((state) => state.screen.playerNameMap);
    const currentPlayerInfo = useAppSelector((state) => state.player);

    // Get participants based on whether user is in office or lobby
    const getParticipants = () => {
        if (isInsideOffice) {
            // In office: use playerNameMap (office members only)
            return Array.from(playerNameMap.entries()).map(([peerId, username]) => ({
                peerId,
                username,
            }));
        } else {
            // In lobby: get all players from game scene
            const gameScene = phaserGame.scene.keys.GameScene as GameScene;
            if (!gameScene || !gameScene.getAllParticipants) {
                return [];
            }
            
            const participants = [];
            
            // Add current player
            if (currentPlayerInfo.username) {
                participants.push({
                    peerId: currentPlayerInfo.sessionId || 'current',
                    username: currentPlayerInfo.username,
                });
            }
            
            // Add other players
            const otherParticipants = gameScene.getAllParticipants();
            participants.push(...otherParticipants);
            
            return participants;
        }
    };

    const participants = getParticipants();

    const handleDisconnect = () => {
        const gameInstance = phaserGame.scene.keys.GameScene as GameScene;
        gameInstance.playerStoppedWebcam();
        setShouldConnectToOtherPlayers(true);
        toast(
            <div className="font-semibold">
                Disconnected from video calls
            </div>
        );
    };

    const handleStartWebcam = async () => {
        const gameInstance = phaserGame.scene.keys.GameScene as GameScene;
        await gameInstance.startWebcam(shouldConnectToOtherPlayers);
        toast(
            <div className="font-semibold">
                Camera Started
            </div>
        );
    };

    return (
        <TooltipProvider>
            <motion.div
                key="game-footer"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{
                    duration: 0.6,
                    ease: [0.25, 0.8, 0.25, 1],
                    delay: 0.3,
                }}
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#121214]/80 backdrop-blur-md shadow-black/30 shadow-lg rounded-lg px-4 py-3"
            >
                {/* Left Side */}
                <div className="flex items-center gap-3">
                    {/* Username with Icon */}
                    <div className="flex items-center gap-2 bg-indigo-600/20 px-3 py-2 rounded-lg">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="text-white text-sm font-medium">{username}</span>
                    </div>

                    {/* Voice Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`cursor-pointer transition-all ease-in-out ${
                                    isMicOn 
                                        ? "bg-green-600/20 border-green-500/50 hover:bg-green-600/30" 
                                        : "bg-red-600/20 border-red-500/50 hover:bg-red-600/30"
                                }`}
                                onClick={() => {
                                    store.dispatch(toggleMic());
                                }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isMicOn ? (
                                        <motion.div
                                            key="mic"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Mic className="w-4 h-4 text-green-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="mic-off"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <MicOff className="w-4 h-4 text-red-400" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-black">
                                {isMicOn ? "Turn off mic" : "Turn on mic"}
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Camera Button */}
                    {myWebcamStream ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`cursor-pointer transition-all ease-in-out ${
                                        isWebcamOn 
                                            ? "bg-green-600/20 border-green-500/50 hover:bg-green-600/30" 
                                            : "bg-red-600/20 border-red-500/50 hover:bg-red-600/30"
                                    }`}
                                    onClick={() => {
                                        store.dispatch(toggleWebcam());
                                    }}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isWebcamOn ? (
                                            <motion.div
                                                key="camera"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Camera className="w-4 h-4 text-green-400" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="camera-off"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <CameraOff className="w-4 h-4 text-red-400" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-black">
                                    {isWebcamOn ? "Turn off camera" : "Turn on camera"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer transition-all ease-in-out bg-red-600/20 border-red-500/50 hover:bg-red-600/30"
                                    onClick={handleStartWebcam}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key="camera-off"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <CameraOff className="w-4 h-4 text-red-400" />
                                        </motion.div>
                                    </AnimatePresence>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-black">Turn on camera</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Screen Sharing Button (only if inside office) */}
                    {isInsideOffice && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer hover:bg-blue-600/30 border-blue-500/50"
                                    onClick={() => {
                                        setScreenDialogOpen(true);
                                    }}
                                >
                                    <ScreenShare className="w-4 h-4 text-blue-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-black">Screen Sharing</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Chat Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`cursor-pointer transition-all ease-in-out ${
                                    showChat 
                                        ? "bg-indigo-600/30 border-indigo-500/50" 
                                        : "hover:bg-indigo-600/20 border-indigo-500/30"
                                }`}
                                onClick={() => setShowChat(!showChat)}
                            >
                                <MessageCircle className="w-4 h-4 text-indigo-400" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-black">
                                {showChat ? "Hide Chat" : "Show Chat"}
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Participants Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer hover:bg-purple-600/20 border-purple-500/30 relative"
                                onClick={() => setShowParticipants(true)}
                            >
                                <Users className="w-4 h-4 text-purple-400" />
                                {participants.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {participants.length}
                                    </span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-black">
                                {isInsideOffice ? "Office Participants" : "All Participants"}
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Leave Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="cursor-pointer transition-all ease-in-out"
                                onClick={handleDisconnect}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key="leave"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PhoneOff className="w-4 h-4" />
                                    </motion.div>
                                </AnimatePresence>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-black">Leave Call</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </motion.div>

            {/* Participants Dialog */}
            <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
                <DialogContent className="bg-[#121214] border-indigo-500/50 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-indigo-400">
                            {isInsideOffice ? "Office Participants" : "All Participants"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {participants.length > 0 ? (
                            participants.map((participant) => (
                                <div 
                                    key={participant.peerId}
                                    className="flex items-center gap-3 p-2 bg-indigo-600/10 rounded-lg"
                                >
                                    <User className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm">{participant.username}</span>
                                    {participant.username === currentPlayerInfo.username && (
                                        <span className="text-xs text-gray-400">(You)</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                {isInsideOffice 
                                    ? "No participants in current office" 
                                    : "No other participants in lobby"
                                }
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
};

export default GameFooter; 