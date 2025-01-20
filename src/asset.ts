import { readFile, stat } from 'fs/promises'
import { utf8Types }      from './mime'
import { Request }        from './request'
import { Response }       from './response'

export async function assetResponse(request: Request, filePath: string, mimeType: string)
{
	const ifModified   = request.headers['if-modified-since']
	const lastModified = new Date((await stat(filePath)).mtime)
	if (ifModified && (new Date(ifModified) >= lastModified)) {
		return new Response('', 304)
	}
	const utf8Type = utf8Types.has(mimeType)
	const headers  = {
		'Content-Type': mimeType + (utf8Type ? '; charset=utf-8' : ''),
		'Last-Modified': lastModified.toUTCString()
	}
	return new Response(await readFile(filePath, utf8Type ? 'utf-8' : undefined), 200, headers)
}
