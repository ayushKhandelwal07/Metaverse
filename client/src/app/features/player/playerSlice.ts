import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
    username: string;
    character: string;
    sessionId: string;
}

const initialState: PlayerState = {
    username: "",
    character: "",
    sessionId: "",
};

const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {
        setPlayerInfo: (
            state,
            action: PayloadAction<{
                username: string;
                character: string;
                sessionId: string;
            }>
        ) => {
            state.username = action.payload.username;
            state.character = action.payload.character;
            state.sessionId = action.payload.sessionId;
        },
        clearPlayerInfo: (state) => {
            state.username = "";
            state.character = "";
            state.sessionId = "";
        },
    },
});

export const { setPlayerInfo, clearPlayerInfo } = playerSlice.actions;
export default playerSlice.reducer; 