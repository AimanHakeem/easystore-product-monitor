import { blue, red, yellow, green } from 'colorette';

class Log {
  messages: string[];

  constructor() {
    this.messages = [];
  }

  private static formatTimestamp = (): string => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds();
    return `[${timestamp}]`;
  };

  static Info = (message: string) => {
    console.log(`${Log.formatTimestamp()} [${blue('INFO')}] ${message}`);
  };

  static Error = (message: string) => {
    console.log(`${Log.formatTimestamp()} [${red('ERROR')}] ${message}`);
  };

  static Warning = (message: string) => {
    console.log(`${Log.formatTimestamp()} [${yellow('Warning')}] ${message}`);
  };

  static Success = (message: string) => {
    console.log(`${Log.formatTimestamp()} [${green('SUCCESS')}] ${message}`);
  };
}

export default Log;
