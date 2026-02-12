const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Personal Library API',
    description: 'Books and Notes CRUD API'
  },
  host: 'cse341-project-3-3d60.onrender.com',
  schemes: ['https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
