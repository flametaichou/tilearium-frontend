import { EntityMove } from '@/classes/entity-move';
import { Point2D } from '@/classes/point2d';

export interface QuestsInfo {
    description: string;
    quests: QuestInfo[];
}

export interface QuestInfo {
    target: Point2D;
    targetEntity: EntityMove;
    action: string;
    main: boolean;
    completed: boolean;
}