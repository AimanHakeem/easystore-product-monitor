class Log {
  messages: string[];

  constructor() {
    this.messages = [];
  }

  static Info = (message: string) => {
    console.log(`[${new Date().toLocaleString()}] [INFO] ${message}`);
  };

  static Error = (message: string) => {
    console.log(`[${new Date().toLocaleString()}] [ERROR] ${message}`);
  };

  static Warning = (message: string) => {
    console.log(`[${new Date().toLocaleString()}] [Warning] ${message}`);
  };

  static Success = (message: string) => {
    console.log(`[${new Date().toLocaleString()}] [SUCCESS] ${message}`);
  };
}
export default Log;
