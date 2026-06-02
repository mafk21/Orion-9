export type StoryBranch = 'default' | 'alternate' | 'danger' | 'hidden';

export type StoryOutcome = 'continue' | 'branch' | 'fail' | 'success';

export type StoryFlag =
  | 'seen_intro'
  | 'signal_verified'
  | 'relay_exposed'
  | 'containment_ready'
  | 'hidden_route_unlocked';

export interface StoryNode {
  id: string;
  chapterId: string;
  title: string;
  summary: string;
  branch: StoryBranch;
  outcome: StoryOutcome;
  requiresFlags?: StoryFlag[];
  unlocksEvidence?: string[];
  unlocksDiscovery?: string[];
  nextNodeIds?: string[];
}

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  nodeIds: string[];
}

export interface EvidenceUnlock {
  id: string;
  label: string;
  type: 'log' | 'signal' | 'recording' | 'map';
  unlockedByFlag?: StoryFlag;
}

export interface StoryProgression {
  currentNodeId?: string;
  currentChapterId?: string;
  flags: StoryFlag[];
  unlockedEvidence: string[];
  hiddenDiscoveries: string[];
  branchHistory: string[];
}

export interface StoryOutcomeResult {
  node: StoryNode;
  progression: StoryProgression;
  outcome: StoryOutcome;
}

export interface StoryEngineState {
  chapters: StoryChapter[];
  nodes: StoryNode[];
  evidence: EvidenceUnlock[];
  progression: StoryProgression;
}
