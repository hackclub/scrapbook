// import metrics from "./metrics";

/**
 * 
 * @param {NextRequest} req 
 * @returns {void}
 */
export function middleware(req) {
    const url = req.url;
    console.log(process.env.NODE_ENV, url);
}

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}