import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

import type { NextApiRequest } from 'next';
import type { NextRequest } from 'next/server';

/**
 * Returns a hashed session id from the user's IP address.
 * 获取用户 IP 地址的哈希值。
 */
export function getSessionId(req: NextApiRequest): string {
    const ipAddressFromHeaders = req.headers['x-forwarded-for'] as
        | string
        | undefined;

    const ipAddress = ipAddressFromHeaders ?? '127.0.0.1';

    const hashedIpAddress = createHash('md5')
        .update(ipAddress + process.env.IP_ADDRESS_SALT)
        .digest('hex');

    return hashedIpAddress;
}


/**
 * Returns the bearer token from the request headers.
 * 从请求头中获取 bearer token。
 */
export function getBearerToken(req: NextRequest): string | null {
    const authorization = req.headers.get('authorization');

    if (!authorization) return null;

    const [authType, bearerToken] = authorization.split(' ');

    if (authType?.toLowerCase() !== 'bearer' || !bearerToken) return null;

    return bearerToken;
}


/**
 * Returns the origin from the request headers.
 * 从请求头 headers 中获取 origin。
 */
export function getOrigin(req: NextRequest): string | null {
    const origin = req.headers.get('origin');

    if (origin) return origin;

    const referer = req.headers.get('referer');

    if (!referer) return null;

    const originFromReferer = new URL(referer).origin;

    return originFromReferer;
}

/**
 * Returns a NextResponse with the given status and message.
 * 生成具有指定状态和消息的 NextResponse。
 */
export function generateNextResponse(
    status: number,
    message: string
): NextResponse {
    return new NextResponse(JSON.stringify({ message }), {
        status,
        headers: { 'content-type': 'application/json' }
    });
}
