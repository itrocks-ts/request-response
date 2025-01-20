
import { Headers } from './server'

export const DELETE = 'DELETE'
export const GET    = 'GET'
export const PATCH  = 'PATCH'
export const POST   = 'POST'
export const PUT    = 'PUT'

export type Files      = Record<string, Buffer>
export type Method     = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
export type Parameters = Record<string, string>
export type Session    = Record<string, any>

type RecursiveString      = RecursiveStringArray | RecursiveStringObject | string
type RecursiveStringArray = RecursiveString[]

export type RecursiveStringObject = { [index: string]: RecursiveString | unknown }

export class Request<T extends object>
{

	constructor(
		public readonly method:     Method,
		public readonly scheme:     string,
		public readonly host:       string,
		public readonly port:       number,
		public readonly path:       string,
		public readonly headers:    Headers               = {},
		public readonly parameters: Parameters            = {},
		public readonly data:       RecursiveStringObject = {},
		public readonly files:      Files                 = {},
		public readonly session:    Session               = {},
		public readonly raw:        T
	) {}

	get url()
	{
		const port  = (this.port ? (':' + this.port) : '')
		const value = new URL(this.scheme + '://' + this.host + port + this.path)
		Object.defineProperty(this, 'url', { value })
		return value
	}

}
