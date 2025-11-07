
import { Headers } from './index'

export const DELETE = 'DELETE'
export const GET    = 'GET'
export const PATCH  = 'PATCH'
export const POST   = 'POST'
export const PUT    = 'PUT'

export type Method     = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
export type Parameters = Record<string, string>
export type Session    = Record<string, any>

type RecursiveValue      = RecursiveValueArray | RecursiveValueObject | RequestFile | string
type RecursiveValueArray = RecursiveValue[]

export type RecursiveValueObject = { [index: string]: RecursiveValue | string }

export class Request<T extends object = object>
{

	constructor(
		public readonly method:     Method,
		public readonly scheme:     string,
		public readonly host:       string,
		public readonly port:       number,
		public readonly path:       string,
		public readonly headers:    Headers              = {},
		public readonly parameters: Parameters           = {},
		public readonly data:       RecursiveValueObject = {},
		public readonly session:    Session              = {},
		public readonly raw?:       T
	) {}

	get url()
	{
		const port  = (this.port ? (':' + this.port) : '')
		const value = new URL(this.scheme + '://' + this.host + port + this.path)
		Object.defineProperty(this, 'url', { configurable: true, enumerable: false, value, writable: true })
		return value
	}

}

export class RequestFile
{

	constructor(public filename: string, public buffer: Buffer)
	{}

}
