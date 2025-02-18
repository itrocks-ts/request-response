
import { Headers } from './index'

export class Response
{

	constructor(
		public body:       object | string = '',
		public statusCode: number          = 200,
		public headers:    Headers         = {},
	) {}

}
