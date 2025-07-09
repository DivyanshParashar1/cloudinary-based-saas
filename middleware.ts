import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import {NextResponse} from "next/server";
import * as url from "node:url";

const isPublicRoute = createRouteMatcher([
    "/signin",
    "/signup",
    "/",
    "/home"
])
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])

export default clerkMiddleware(async (auth, req) =>{
    const { userId } = await auth()
    const currentURL = new URL(req.url);
    const isAccessingDashboard = currentURL.pathname === "/home";
    const isApiRequest = currentURL.pathname.startsWith("/api");

    //if the user is logged in
    if(userId && isPublicRoute(req) && !isAccessingDashboard){
        return NextResponse.redirect(new URL("/home", req.url));
    }
    //not logged in
    if(!userId){
        //if the user is not logged in and is trying to access a protected route or api
        if(!isPublicRoute(req) && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/signin", req.url));
        }
        //if the user is not logged in and is trying to access a protected api
        if(isApiRequest && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/signin", req.url));
        }
    }
    return NextResponse.next();
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}