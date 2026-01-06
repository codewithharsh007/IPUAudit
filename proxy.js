import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Decode token once if it exists
  let decoded = null;
  if (token) {
    decoded = verifyToken(token);
  }

  // Public routes (college login/signup)
  if (pathname === "/" || pathname.startsWith("/signup")) {
    // If already logged in, redirect to appropriate dashboard
    if (decoded) {
      if (decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (decoded.role === "college") {
        return NextResponse.redirect(
          new URL("/dashboard", request.url),
        ); // Fixed path
      }
    }
    return NextResponse.next();
  }

  // Admin login page
  if (pathname === "/admin/login") {
    if (decoded) {
      // If logged in as admin, go to admin dashboard
      if (decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      // If logged in as college, redirect back to college dashboard
      if (decoded.role === "college") {
        return NextResponse.redirect(
          new URL("/dashboard", request.url),
        ); // Fixed path
      }
    }
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!token || !decoded) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If college tries to access admin routes, redirect to college dashboard
    if (decoded.role === "college") {
      return NextResponse.redirect(new URL("/college/dashboard", request.url)); // Fixed path
    }

    // If not admin, redirect to admin login
    if (decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // College protected routes - FIXED TO INCLUDE /college PATH
  if (pathname.startsWith("/college")) {
    if (!token || !decoded) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If admin tries to access college routes, redirect to admin dashboard
    if (decoded.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // If not college, redirect to college login
    if (decoded.role !== "college") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Legacy college routes (if you have /dashboard without /college prefix)
  const legacyCollegeRoutes = ["/dashboard", "/profile", "/change-password"];
  const isLegacyCollegeRoute = legacyCollegeRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isLegacyCollegeRoute) {
    if (!token || !decoded) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If admin tries to access college routes, redirect to admin dashboard
    if (decoded.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // If not college, redirect to college login
    if (decoded.role !== "college") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
