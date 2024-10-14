import { AxiosResponse } from 'axios';
import Error from 'next/error';

export interface ErrorResponse extends AxiosResponse {
    err: Error;
}
