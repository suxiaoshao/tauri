import { RequestBody } from './body';

export default interface Request {
  method: HttpMethod;
  url: HttpUrl;
  headers: HttpHeader[];
  body: RequestBody;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
}

export interface HttpUrl {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  hash: string;
}

export interface HttpHeader {
  key: string;
  value: string;
}
