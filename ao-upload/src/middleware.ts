import { env } from '~/env';
import { NextResponse } from 'next/server';
import { generateNextResponse, getBearerToken, getOrigin } from '~/lib/helper/check';

import type { NextRequest } from 'next/server';

/**
 * Middleware function to authenticate and authorize incoming requests based on their origin and Bearer token.
 * 根据请求的源和Bearer token验证及授权传入请求的中间件函数。
 */
export function middleware(req: NextRequest): NextResponse {
    const origin = getOrigin(req);

    const isValidOrigin = env.IS_DEVELOPMENT
        ? [env.NEXT_PUBLIC_URL, 'http://localhost'].includes(origin as unknown as string)
        : origin === env.NEXT_PUBLIC_URL;

    if (!isValidOrigin) return generateNextResponse(403, 'Forbidden');

    const bearerToken = getBearerToken(req);

    // If the Bearer token does not match the predefined owner token, unauthorized response is returned.
    // 如果Bearer token与预定义的所有者Token不匹配，则返回未经授权的响应。
    if (bearerToken !== env.OWNER_BEARER_TOKEN)
        return generateNextResponse(401, 'Unauthorized');

    return NextResponse.next();
}

type Config = {
    matcher: string;
};

export const config: Config = {
    // Matches all API routes except those under /api/auth/* and /api/og.
    // 匹配所有API路由，除了那些位于/api/auth/*和/api/og下的。
    matcher: '/api/((?!auth|og).*)'
};