import expressJSDocSwagger from 'express-jsdoc-swagger';
import process from 'node:process';
export default function doc(app){
const docConfig = {
    info: {
      version: '1.0.0',
      title: 'Backend API',
    },
    filePattern: './src/**/*.js',
    swaggerUIPath: '/api-docs',  
    baseDir:process.cwd(),     
};
expressJSDocSwagger(app)(docConfig);

}
