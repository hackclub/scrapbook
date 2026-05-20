export type Severity = "low" | "medium" | "high";

export type InputType = "text" | "image";

export type FindingSource =
  | "openai_moderation"
  | "ad_heuristic"
  | "teen_safety_rule"
  | "link_rule"
  | "trust_rule"
  | "tool_error"
  | "dry_run";

export type Finding = {
  source: FindingSource;
  label: string;
  severity: Severity;
  score?: number;
  detail?: string;
  inputTypes?: InputType[];
};

export type AuditUser = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  image: string | null;
  slackID: string | null;
  createdAt: Date | null;
};

export type AuditUpdate = {
  id: string;
  postTime: Date | null;
  text: string | null;
  attachments: string[];
  muxPlaybackIDs: string[];
  accountsID: string | null;
  accountsSlackID: string | null;
  messageTimestamp: number | null;
  channel: string | null;
  Accounts: AuditUser | null;
  SlackAccounts: AuditUser | null;
};

export type Checkpoint = {
  lastPostTime: string | null;
  lastUpdateId: string | null;
  postsScanned: number;
  postsModerated: number;
  postsSkippedTrusted: number;
  errors: number;
  updatedAt: string;
};

export type Summary = {
  postsScanned: number;
  postsSkippedTrusted: number;
  postsModerated: number;
  usersFlagged: number;
  postsFlagged: number;
  errors: number;
};

export type ReportPriority = "new_account" | "regular" | "trusted_skip_overridden";

export type ReportPost = {
  postId: string;
  postUrl: string | null;
  createdAt: string;
  contentPreview: string;
  imageUrls: string[];
  reasons: Finding[];
  rawModeration?: unknown;
};

export type ReportUser = {
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    createdAt: string | null;
    avatar: string | null;
    profileUrl: string | null;
    knownGoodPostCount: number;
  };
  priority: ReportPriority;
  flaggedPosts: ReportPost[];
};

export type ModerationReport = {
  generatedAt: string;
  config: {
    model: string;
    trustedGoodPostThreshold: number;
    newAccountYears: number;
    maxImagesPerPost: number;
    maxImageBytes: number;
    includeRawOpenAI: boolean;
  };
  summary: Summary;
  users: ReportUser[];
};

export type ErrorLogEntry = {
  postId?: string;
  userId?: string;
  stage: string;
  error: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ErrorReportPost = {
  postId: string;
  postUrl: string | null;
  createdAt: string | null;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    createdAt: string | null;
    avatar: string | null;
    profileUrl: string | null;
  };
  text: string;
  attachments: string[];
  muxPlaybackIDs: string[];
  stage: string;
  error: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
};

export type ModerationErrorReport = {
  generatedAt: string;
  summary: {
    postsWithErrors: number;
    totalErrors: number;
  };
  errors: ErrorReportPost[];
};
