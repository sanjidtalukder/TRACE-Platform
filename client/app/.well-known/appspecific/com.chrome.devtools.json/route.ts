import { NextResponse } from 'next/server';

/**
 * Handle automated Chrome DevTools workspace discovery probe.
 * Prevents 404 logs in development terminal when Chrome DevTools is open.
 */
export async function GET() {
  return NextResponse.json({}, { status: 200 });
}
