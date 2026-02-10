
export interface MoodEntry {
  id: string;
  timestamp: string;
  score: number;
  label: string;
  sentiment: string;
  dominantEmotion: string;
  journalText?: string;
}

export interface Recommendation {
  title: string;
  description: string;
  type: 'exercise' | 'meditation' | 'journaling' | 'break' | 'professional';
  urgency: 'low' | 'medium' | 'high';
}

export interface InsightReport {
  overallMood: string;
  riskScore: number;
  stressMarkers: string[];
  recommendations: Recommendation[];
  crisisWarning: boolean;
}

export type View = 'dashboard' | 'journal' | 'voice' | 'history' | 'resources' | 'nearby' | 'chat' | 'mindfulness' | 'live-session' | 'emergency' | 'mobile-app';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  useProxy?: boolean;
}

export interface AlertConfig {
  method: 'textbelt' | 'native' | 'twilio' | 'ifttt';
  twilio?: TwilioConfig;
  ifttt?: {
    webhookKey: string;
    eventName: string;
  };
  useProxy: boolean;
}

export enum Emotion {
  STRESSED = 'Stressed',
  ANXIOUS = 'Anxious',
  CALM = 'Calm',
  HAPPY = 'Happy',
  SAD = 'Sad',
  TIRED = 'Tired',
  ANGRY = 'Angry'
}

export interface GroundingLink {
  title: string;
  uri: string;
  snippet?: string;
}
