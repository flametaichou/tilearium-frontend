export interface GameOverInfo {
    players: PlayerGameOverInfo[];
}

export interface PlayerGameOverInfo {
    name: string;
    winner: boolean;
    points: number;
}