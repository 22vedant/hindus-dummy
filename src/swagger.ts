import swaggerAutogen from 'swagger-autogen';
import { doc } from './docs.js';

const outputFile = './swagger-output.json';
const routes = ['./index.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);