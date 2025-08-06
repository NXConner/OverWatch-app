import { EventEmitter } from 'events';
import { MessagingApi, Logger } from '@blacktop-blackout-monorepo/shared-types';

export interface MessageHandler {
  (message: any): void | Promise<void>;
}

export interface MessageSubscription {
  topic: string;
  handler: MessageHandler;
  id: string;
}

export class MessagingService extends EventEmitter implements MessagingApi {
  private logger: Logger;
  private subscriptions: Map<string, MessageSubscription[]> = new Map();
  private messageHistory: Map<string, any[]> = new Map();
  private maxHistoryPerTopic: number = 100;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
    this.setMaxListeners(1000); // Allow many subscribers
  }

  /**
   * Publish a message to a topic
   */
  async publish(topic: string, message: any): Promise<void> {
    try {
      this.logger.debug(`Publishing message to topic: ${topic}`, { topic, messageType: typeof message });

      // Add timestamp to message
      const enrichedMessage = {
        ...message,
        _timestamp: new Date(),
        _topic: topic
      };

      // Store in history
      this.addToHistory(topic, enrichedMessage);

      // Get subscribers for this topic
      const subscribers = this.subscriptions.get(topic) || [];
      
      if (subscribers.length === 0) {
        this.logger.debug(`No subscribers found for topic: ${topic}`);
        return;
      }

      // Emit to all subscribers
      this.emit(topic, enrichedMessage);

      // Also call handlers directly
      const promises = subscribers.map(async (subscription) => {
        try {
          await subscription.handler(enrichedMessage);
        } catch (error) {
          this.logger.error(`Error in message handler for topic ${topic}:`, {
            error: error.message,
            subscriptionId: subscription.id
          });
        }
      });

      await Promise.allSettled(promises);

      this.logger.debug(`Message published successfully to ${subscribers.length} subscribers on topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(topic: string, callback: MessageHandler): Promise<void> {
    try {
      const subscriptionId = this.generateSubscriptionId();
      
      const subscription: MessageSubscription = {
        topic,
        handler: callback,
        id: subscriptionId
      };

      // Add to subscriptions map
      if (!this.subscriptions.has(topic)) {
        this.subscriptions.set(topic, []);
      }
      this.subscriptions.get(topic)!.push(subscription);

      // Add event listener
      this.on(topic, callback);

      this.logger.info(`Subscribed to topic: ${topic}`, { subscriptionId, totalSubscribers: this.subscriptions.get(topic)!.length });
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(topic: string, callback?: MessageHandler): Promise<void> {
    try {
      if (callback) {
        // Remove specific callback
        this.off(topic, callback);
        
        // Remove from subscriptions map
        const subscriptions = this.subscriptions.get(topic) || [];
        const updatedSubscriptions = subscriptions.filter(sub => sub.handler !== callback);
        
        if (updatedSubscriptions.length === 0) {
          this.subscriptions.delete(topic);
        } else {
          this.subscriptions.set(topic, updatedSubscriptions);
        }
        
        this.logger.info(`Unsubscribed from topic: ${topic}`, { remainingSubscribers: updatedSubscriptions.length });
      } else {
        // Remove all listeners for topic
        this.removeAllListeners(topic);
        this.subscriptions.delete(topic);
        
        this.logger.info(`Unsubscribed all listeners from topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Get message history for a topic
   */
  getMessageHistory(topic: string, limit?: number): any[] {
    const history = this.messageHistory.get(topic) || [];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get list of all topics
   */
  getTopics(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get subscribers count for a topic
   */
  getSubscriberCount(topic: string): number {
    return (this.subscriptions.get(topic) || []).length;
  }

  /**
   * Get all subscriptions
   */
  getAllSubscriptions(): Map<string, number> {
    const result = new Map<string, number>();
    this.subscriptions.forEach((subs, topic) => {
      result.set(topic, subs.length);
    });
    return result;
  }

  /**
   * Clear message history for a topic
   */
  clearHistory(topic?: string): void {
    if (topic) {
      this.messageHistory.delete(topic);
      this.logger.info(`Cleared message history for topic: ${topic}`);
    } else {
      this.messageHistory.clear();
      this.logger.info('Cleared all message history');
    }
  }

  /**
   * Broadcast message to all topics
   */
  async broadcast(message: any): Promise<void> {
    const topics = this.getTopics();
    const promises = topics.map(topic => this.publish(topic, message));
    await Promise.allSettled(promises);
    this.logger.info(`Broadcasted message to ${topics.length} topics`);
  }

  /**
   * Create a request-response pattern
   */
  async request(topic: string, message: any, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const responseId = this.generateSubscriptionId();
      const responseTopic = `${topic}:response:${responseId}`;
      
      // Set up response listener
      const responseHandler = (response: any) => {
        this.unsubscribe(responseTopic, responseHandler);
        resolve(response);
      };

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.unsubscribe(responseTopic, responseHandler);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      // Subscribe to response
      this.subscribe(responseTopic, (response) => {
        clearTimeout(timeoutId);
        responseHandler(response);
      });

      // Publish request with response topic
      this.publish(topic, {
        ...message,
        _responseId: responseId,
        _responseTopic: responseTopic
      });
    });
  }

  /**
   * Reply to a request
   */
  async reply(originalMessage: any, response: any): Promise<void> {
    if (originalMessage._responseTopic) {
      await this.publish(originalMessage._responseTopic, response);
    } else {
      this.logger.warn('Cannot reply to message without response topic', originalMessage);
    }
  }

  /**
   * Create a topic pattern subscription (wildcard support)
   */
  async subscribePattern(pattern: string, callback: MessageHandler): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    const wrappedCallback = (message: any) => {
      if (regex.test(message._topic)) {
        callback(message);
      }
    };

    // Subscribe to a special pattern topic
    await this.subscribe(`__pattern__${pattern}`, wrappedCallback);
    
    // Override publish to check patterns
    const originalPublish = this.publish.bind(this);
    this.publish = async (topic: string, message: any) => {
      await originalPublish(topic, message);
      
      // Check if topic matches any patterns
      const patternSubscriptions = Array.from(this.subscriptions.keys())
        .filter(key => key.startsWith('__pattern__'));
      
      for (const patternKey of patternSubscriptions) {
        const patternString = patternKey.replace('__pattern__', '');
        const patternRegex = new RegExp(patternString.replace(/\*/g, '.*'));
        
        if (patternRegex.test(topic)) {
          this.emit(patternKey, message);
        }
      }
    };
  }

  /**
   * Get messaging statistics
   */
  getStats(): {
    totalTopics: number;
    totalSubscriptions: number;
    totalMessages: number;
    memoryUsage: number;
  } {
    let totalSubscriptions = 0;
    let totalMessages = 0;

    this.subscriptions.forEach(subs => {
      totalSubscriptions += subs.length;
    });

    this.messageHistory.forEach(history => {
      totalMessages += history.length;
    });

    return {
      totalTopics: this.subscriptions.size,
      totalSubscriptions,
      totalMessages,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  private addToHistory(topic: string, message: any): void {
    if (!this.messageHistory.has(topic)) {
      this.messageHistory.set(topic, []);
    }

    const history = this.messageHistory.get(topic)!;
    history.push(message);

    // Maintain history size
    if (history.length > this.maxHistoryPerTopic) {
      history.shift();
    }
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown messaging service
   */
  shutdown(): void {
    this.removeAllListeners();
    this.subscriptions.clear();
    this.messageHistory.clear();
    this.logger.info('Messaging service shutdown completed');
  }
}