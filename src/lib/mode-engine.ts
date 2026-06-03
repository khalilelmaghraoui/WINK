import type { Invite, InviteMode } from "./invite-store";

export const compatibilityScore = "94.7%";

export interface ModePresentationConfig {
  mode: InviteMode;
  modeLabel: string;
  headline: string;
  subtitle: string;
  body: string;
  compatibilityReport: {
    score: typeof compatibilityScore;
    heading: string;
    copy: string;
    disclaimer: string;
  };
  responseCopy: {
    yes: string;
    raincheck: string;
    no: string;
  };
  safetyNote: string;
}

const modeConfig: Record<InviteMode, Omit<ModePresentationConfig, "mode">> = {
  lawyer: {
    modeLabel: "Lawyer",
    headline: "The case for saying yes has been prepared.",
    subtitle: "A lightly formal argument, submitted for your consideration.",
    body: "No objections are expected, but all responses remain fully allowed.",
    compatibilityReport: {
      score: compatibilityScore,
      heading: "Compatibility Report",
      copy: "Evidence suggests this plan is charming, low-risk, and possibly worth wearing nice shoes for.",
      disclaimer: "This is a joke report, not science."
    },
    responseCopy: {
      yes: "Accept the case",
      raincheck: "Request continuance",
      no: "Dismiss politely"
    },
    safetyNote: "You can say no. The court will remain calm."
  },
  unbothered: {
    modeLabel: "Unbothered",
    headline: "No pressure. Just an unusually solid invitation.",
    subtitle: "Casual confidence, neatly placed in your browser.",
    body: "This invitation is trying very hard to look like it is not trying.",
    compatibilityReport: {
      score: compatibilityScore,
      heading: "Compatibility Report",
      copy: "The vibe audit is complete: relaxed, promising, and suspiciously well timed.",
      disclaimer: "This is a playful read, not a prediction."
    },
    responseCopy: {
      yes: "I'm in",
      raincheck: "Another time",
      no: "No thanks"
    },
    safetyNote: "No is a complete answer."
  }
};

export function getModePresentation(invite: Invite): ModePresentationConfig {
  return {
    mode: invite.mode,
    ...modeConfig[invite.mode]
  };
}
