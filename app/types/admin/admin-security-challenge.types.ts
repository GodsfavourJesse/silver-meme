export type AdminChallengeQuestionType = "multiple-choice" | "visual-match";

export interface AdminChallengeOption {
    id: string;
    label: string;
}

/** Public question payload returned by the backend. Correct answers are never sent to the browser. */
export interface AdminSecurityChallengeQuestion {
    stage: number;
    title: string;
    instruction: string;
    type: AdminChallengeQuestionType;
    options?: AdminChallengeOption[];
    referenceAsset?: string;
    imageOptions?: string[];
}

export interface StartAdminSecurityChallengeResponse {
    challengeToken: string;
    expiresAt: string;
    totalStages: number;
    question: AdminSecurityChallengeQuestion;
}

export interface SubmitAdminSecurityChallengeAnswerResponse {
    completed: boolean;
    completedStages: number;
    totalStages: number;
    nextQuestion?: AdminSecurityChallengeQuestion;
}
