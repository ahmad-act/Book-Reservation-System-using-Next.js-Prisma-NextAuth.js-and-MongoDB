import errorLog from './errorLog';

class CustomError extends Error {
    error: string = '';
    status: number = 500;

    //constructor(message: string, error: { message: string, error: string, status: number } = { message: '', error: '', status: 500 }, flug: string = '') {
    constructor(message: string, error: any, flug: string = '') {

        const err = errorLog(message, error, flug);
        super(err.message);
        this.name = 'CustomError';
        this.error = err.error;
        this.status = err.status;
    }
}

export default CustomError
