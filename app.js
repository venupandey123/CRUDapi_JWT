// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


// dotenv.config();
// connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Swagger Configuration
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Task Manager API',
        version: '1.0.0',
        description: 'A simple CRUD API using Express and MongoDB',
      },
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./routes/*.js'], // Swagger will scan this file for comments
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;






