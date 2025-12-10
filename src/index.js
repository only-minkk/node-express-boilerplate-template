const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

// mongoDB 연결 후 서버 시작
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => {
    // 연결 실패 시 처리
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// 에러 발생 시 종료 처리 함수(graceful shutdown)
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      mongoose.connection.close(false, () => {
        // MongoDB 연결 종료
        logger.info('MongoDB connection closed');
        process.exit(1);
      });
    });
  } else {
    mongoose.connection.close(false, () => {
      // MongoDB 연결 종료
      logger.info('MongoDB connection closed');
      process.exit(1);
    });
  }
};

const unexpectedErrorHandler = (error) => {
  // 예상치 못한 에러 발생 시 처리
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler); // 잡지 못한 에러 발생 시 처리
process.on('unhandledRejection', unexpectedErrorHandler); // 처리되지 않은 Promise 거부 발생 시 처리

process.on('SIGTERM', () => {
  // SIGTERM 신호 수신 시 처리(graceful shutdown)
  logger.info('SIGTERM received');
  if (server) {
    server.close(() => {
      // 서버 종료
      logger.info('Server closed');
      mongoose.connection.close(false, () => {
        // MongoDB 연결 종료
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close(false, () => {
      // MongoDB 연결 종료
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  // SIGINT 신호 수신 시 처리(graceful shutdown)
  logger.info('SIGINT received');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      mongoose.connection.close(false, () => {
        // MongoDB 연결 종료
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close(false, () => {
      // MongoDB 연결 종료
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  }
});
