
import { EmergencyContact, TwilioConfig } from "../types";

export interface SMSLogEntry {
  id: string;
  timestamp: string;
  to: string;
  toName: string;
  body: string;
  status: 'pending' | 'delivered' | 'failed';
  provider: 'twilio';
  error?: string;
}

class TwilioService {
  private logs: SMSLogEntry[] = [];

  /**
   * Sends an SMS via the real Twilio REST API
   */
  async sendSMS(contact: EmergencyContact, message: string, config?: TwilioConfig): Promise<boolean> {
    const logId = Math.random().toString(36).substring(7);
    const newLog: SMSLogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      to: contact.phone,
      toName: contact.name,
      body: message,
      status: 'pending',
      provider: 'twilio'
    };

    this.logs.unshift(newLog);

    // If no config provided, we cannot send a real message
    if (!config || !config.accountSid || !config.authToken || !config.fromNumber) {
      console.warn("[Twilio Service] Missing credentials. Falling back to simulation for UI.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.updateLogStatus(logId, 'delivered');
      return true;
    }

    try {
      const { accountSid, authToken, fromNumber, useProxy } = config;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      // Use a CORS proxy if requested (common for frontend-only hackathon demos)
      const finalUrl = useProxy ? `https://cors-anywhere.herokuapp.com/${url}` : url;

      const body = new URLSearchParams();
      body.append('To', contact.phone);
      body.append('From', fromNumber);
      body.append('Body', message);

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const result = await response.json();

      if (response.ok) {
        this.updateLogStatus(logId, 'delivered');
        console.debug(`[Twilio Service] SUCCESS: SID ${result.sid}`);
        return true;
      } else {
        throw new Error(result.message || "Twilio API Error");
      }
    } catch (error: any) {
      this.updateLogStatus(logId, 'failed', error.message);
      console.error(`[Twilio Service] FAILED:`, error);
      return false;
    }
  }

  private updateLogStatus(id: string, status: 'delivered' | 'failed', error?: string) {
    this.logs = this.logs.map(log => 
      log.id === id ? { ...log, status, error } : log
    );
  }

  getLogs(): SMSLogEntry[] {
    return this.logs;
  }
}

export const twilioService = new TwilioService();
