//import { errorLogger } from './logger';

function errorLog(message, error, flug = '') {
    let errors = { message, error: error.error ?? error.message, status: error.statusCode };

    // duplicate email error form MongoDB Atlas database
    if (error && error.message && error.message.includes('E11000')) {
        errors.status = 400;
        if (flug === 'login-user-register') {
            errors.message = 'The email is already existed';
        }
        else {
            errors.message = 'The value is already existed, please check unique value field';
        }

    }

    // if table id not match form MongoDB Atlas database
    if (error && error.message && error.message.includes('Cast to ObjectId failed for value')) {
        errors.error = 'The record is not found';
    }


    //errorLogger.error(`Message : ${message} /nError : ${errors.error}/nStatusCode : ${errors.status}/nDetails : ${error}`);

    return errors;
}

export default errorLog;