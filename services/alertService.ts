
import { EmergencyContact, AlertConfig } from "../types";

export interface AlertLogEntry {
  id: string;
  timestamp: string;
  to: string;
  toName: string;
  body: string;
  status: 'pending' | 'delivered' | 'failed' | 'native_opened' | 'dispatched';
  method: 'textbelt' | 'native' | 'twilio' | 'ifttt';
  error?: string;
}

class AlertService {
  private logs: AlertLogEntry[] = [];

  async sendAlert(contact: EmergencyContact, message: string, config: AlertConfig): Promise<boolean> {
    const logId = Math.random().toString(36).substring(7);
    const newLog: AlertLogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      to: contact.phone,
      toName: contact.name,
      body: message,
      status: 'pending',
      method: config.method
    };

    this.logs.unshift(newLog);

    try {
      // 1. TEXTBELT METHOD
      if (config.method === 'textbelt') {
        const textbeltUrl = 'https://textbelt.com/text';
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(textbeltUrl)}`;

        const params = new URLSearchParams();
        params.append('phone', contact.phone);
        params.append('message', message);
        params.append('key', 'textbelt');

        try {
          const response = await fetch(proxyUrl, {
            method: 'POST',
            body: params
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              this.updateLogStatus(logId, 'delivered');
              return true;
            } else {
              throw new Error(data.error || "Daily limit reached.");
            }
          }
          throw new Error("Relay refused connection.");
        } catch (relayError) {
          await fetch(textbeltUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
          });
          this.updateLogStatus(logId, 'dispatched');
          return true;
        }
      }

      // 2. NATIVE METHOD
      if (config.method === 'native') {
        const smsLink = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
        window.open(smsLink);
        this.updateLogStatus(logId, 'native_opened');
        return true;
      }

      // 3. TWILIO METHOD
      if (config.method === 'twilio' && config.twilio) {
        const { accountSid, authToken, fromNumber } = config.twilio;
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

        const body = new URLSearchParams();
        body.append('To', contact.phone);
        body.append('From', fromNumber);
        body.append('Body', message);

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        });

        if (response.ok) {
          this.updateLogStatus(logId, 'delivered');
          return true;
        } else {
          const err = await response.json();
          throw new Error(err.message || "Twilio error");
        }
      }

      // 4. IFTTT METHOD (Updated with Proxy for JSON support)
      if (config.method === 'ifttt' && config.ifttt) {
        const { webhookKey, eventName } = config.ifttt;
        const iftttUrl = `https://maker.ifttt.com/trigger/${eventName}/with/key/${webhookKey}`;
        
        // IFTTT requires Content-Type: application/json to parse Value1/2/3.
        // Direct browser fetch to IFTTT usually fails CORS, so we proxy it.
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(iftttUrl)}`;
        
        const payload = { 
          value1: contact.name, 
          value2: message, 
          value3: contact.phone 
        };

        try {
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            this.updateLogStatus(logId, 'delivered');
            return true;
          } else {
            throw new Error(`IFTTT returned status ${response.status}`);
          }
        } catch (err) {
          console.warn("IFTTT Proxy failed, attempting direct (might fail CORS)...");
          // Fallback to direct call in case proxy is down
          await fetch(iftttUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          this.updateLogStatus(logId, 'dispatched');
          return true;
        }
      }

      return false;
    } catch (error: any) {
      this.updateLogStatus(logId, 'failed', error.message);
      return false;
    }
  }

  private updateLogStatus(id: string, status: AlertLogEntry['status'], error?: string) {
    this.logs = this.logs.map(log => log.id === id ? { ...log, status, error } : log);
  }

  getLogs(): AlertLogEntry[] {
    return this.logs;
  }
}

export const alertService = new AlertService();
