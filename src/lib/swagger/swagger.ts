// import swaggerAutogen from 'swagger-autogen';
import { options } from './docs.ts';

// const outputFile = './swagger-output.json';
// const routes = ['../routes/**/*.ts'];

// swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);

import swaggerJSdoc from "swagger-jsdoc"
export const swaggerSpecification = swaggerJSdoc(options)
