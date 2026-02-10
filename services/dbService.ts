
import { MoodEntry, InsightReport, EmergencyContact, AlertConfig } from "../types";

const DB_NAME = 'MindGuardDB';
const DB_VERSION = 2; 
const STORES = {
  USERS: 'users',     // Stores credentials { email, password, name, type }
  PROFILE: 'profile', // Keyed by email
  MOODS: 'moods',     // Keyed by email
  INSIGHTS: 'insights', // Keyed by email
  CONTACTS: 'contacts', // Keyed by email
  CONFIG: 'config'    // Keyed by email
};

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('Failed to open IndexedDB');
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        });
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };
    });
  }

  private async perform<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<T> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // User Auth Operations
  async createUser(user: any): Promise<void> {
    const existing = await this.perform(STORES.USERS, 'readonly', store => store.get(user.email));
    if (existing) throw new Error("Email already registered.");
    return this.perform(STORES.USERS, 'readwrite', store => store.put(user, user.email));
  }

  async verifyUser(email: string, password?: string): Promise<any> {
    const user = await this.perform<any>(STORES.USERS, 'readonly', store => store.get(email));
    if (!user) return null;
    
    // For Google users, we don't check password
    if (user.type === 'google') return user;
    
    // Simple password check (In production, use bcrypt)
    if (user.password === password) return user;
    return null;
  }

  // Profile Operations
  async saveProfile(profile: { name: string, email: string, reason?: string }): Promise<void> {
    return this.perform(STORES.PROFILE, 'readwrite', store => store.put(profile, profile.email));
  }

  async getProfile(email: string): Promise<any> {
    return this.perform(STORES.PROFILE, 'readonly', store => store.get(email));
  }

  // Mood History Operations
  async saveMoods(email: string, moods: MoodEntry[]): Promise<void> {
    return this.perform(STORES.MOODS, 'readwrite', store => store.put(moods, email));
  }

  async getMoods(email: string): Promise<MoodEntry[]> {
    const result = await this.perform<MoodEntry[]>(STORES.MOODS, 'readonly', store => store.get(email));
    return result || [];
  }

  // Insights
  async saveLatestInsight(email: string, insight: InsightReport): Promise<void> {
    return this.perform(STORES.INSIGHTS, 'readwrite', store => store.put(insight, email));
  }

  async getLatestInsight(email: string): Promise<InsightReport | null> {
    return this.perform(STORES.INSIGHTS, 'readonly', store => store.get(email));
  }

  // Contacts
  async saveContacts(email: string, contacts: EmergencyContact[]): Promise<void> {
    return this.perform(STORES.CONTACTS, 'readwrite', store => store.put(contacts, email));
  }

  async getContacts(email: string): Promise<EmergencyContact[]> {
    const result = await this.perform<EmergencyContact[]>(STORES.CONTACTS, 'readonly', store => store.get(email));
    return result || [];
  }

  // Config
  async saveConfig(email: string, config: AlertConfig): Promise<void> {
    return this.perform(STORES.CONFIG, 'readwrite', store => store.put(config, email));
  }

  async getConfig(email: string): Promise<AlertConfig | null> {
    return this.perform(STORES.CONFIG, 'readonly', store => store.get(email));
  }
}

export const dbService = new DatabaseService();
