import Chat from "./components/Chat";
import { useAppSelector } from "./app/hooks";
import RoomSelection from "./components/RoomSelection/RoomSelection";
import ScreenShare from "./components/ScreenShare";
import { useState } from "react";
import GameFooter from "./components/GameFooter";
import { AnimatePresence } from "framer-motion";
import VideoCall from "./components/VideoCall";

function App() {
    const roomJoined = useAppSelector((state) => state.room.roomJoined);
    const showOfficeChat = useAppSelector((state) => state.chat.showOfficeChat);
    const username = useAppSelector((state) => state.player.username);
    const [screenDialogOpen, setScreenDialogOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    return (
        <>
            {!roomJoined && <RoomSelection />}
            {roomJoined && (
                <>
                    {showChat && <Chat setShowChat={setShowChat} />}
                    <VideoCall />
                    <AnimatePresence mode="wait">
                        <GameFooter
                            key="game-footer"
                            isInsideOffice={showOfficeChat}
                            username={username}
                            setScreenDialogOpen={setScreenDialogOpen}
                            setShowChat={setShowChat}
                            showChat={showChat}
                        />
                    </AnimatePresence>
                </>
            )}

            {showOfficeChat && (
                <>
                    <ScreenShare
                        screenDialogOpen={screenDialogOpen}
                        setScreenDialogOpen={setScreenDialogOpen}
                    />
                </>
            )}
        </>
    );
}

export default App;